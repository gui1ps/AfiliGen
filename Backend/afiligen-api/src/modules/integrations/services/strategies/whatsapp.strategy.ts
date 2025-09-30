import { IntegrationsService } from '../integrations.service';
import { Client, LocalAuth } from 'whatsapp-web.js';
import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  BadRequestException,
  OnApplicationShutdown,
} from '@nestjs/common';
import { UserService } from 'src/modules/users/user.service';
import * as qrcode from 'qrcode-terminal';
import { SendMessageDto } from '../../dtos/whatsapp-message.dto';
import { GroupChat } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';

const clients: Map<string, Client> = new Map();

@Injectable()
export class WhatsappService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private integrationsService: IntegrationsService,
    private userService: UserService,
  ) {}

  async deleteSession(userUuid: string) {
    const sessionsDir = path.join(process.cwd(), '.wwebjs_auth');
    if (fs.existsSync(sessionsDir)) {
      const sessionFolders = fs.readdirSync(sessionsDir);
      for (const folder of sessionFolders) {
        const folderPath = path.join(sessionsDir, folder);
        const userIdentification = folder.replace('session-', '');
        if (userIdentification === userUuid) {
          try {
            await fs.promises.rm(folderPath, { force: true, recursive: true });
          } catch (err) {
            this.logger.log(`Erro ao apgar a pasta ${folderPath}`);
          }
        }
      }
    }
  }

  async onModuleInit() {
    const sessionsDir = path.join(process.cwd(), '.wwebjs_auth');
    if (fs.existsSync(sessionsDir)) {
      const sessionFolders = fs.readdirSync(sessionsDir);
      for (const folder of sessionFolders) {
        const folderPath = path.join(sessionsDir, folder);
        try {
          await fs.promises.rm(folderPath, { force: true, recursive: true });
        } catch (err) {
          this.logger.log(`Erro ao apgar a pasta ${folderPath}`);
        }
      }
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`App desligando (${signal}), destruindo clientes...`);
    for (const [uuid, client] of clients) {
      await client.destroy();
      this.logger.log(`Cliente ${uuid} destruído`);
    }
  }

  async checkClientState(client: Client): Promise<string> {
    const state = await client.getState();
    return state;
  }

  async connect(userUuid: string): Promise<any> {
    const user = await this.userService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);

    if (clients.has(userUuid)) {
      this.logger.log(`Cliente já existente para usuário ${user.name}`);
      return { status: 'already_connected' };
    }

    try {
      const whatsappIntegration =
        await this.integrationsService.getUserIntegration(
          userUuid,
          undefined,
          'whatsapp',
        );
      if (whatsappIntegration.status !== 'active') {
        await this.integrationsService.updateIntegrationStatus(
          userUuid,
          whatsappIntegration.id,
          { status: 'active' },
        );
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        await this.integrationsService.create(userUuid, {
          provider: 'whatsapp',
          type: 'social',
        });
      } else {
        throw err;
      }
    }

    let client: Client | null = null;
    try {
      client = new Client({
        puppeteer: {
          executablePath:
            process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
          headless: true,
          dumpio: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-features=site-per-process',
          ],
        },
        authStrategy: new LocalAuth({
          clientId: userUuid,
        }),
      });
    } catch (error) {
      new ConflictException(`Unable to start client.`);
    }

    if (!client) return;

    return new Promise((resolve, reject) => {
      client.on('qr', async (qr) => {
        this.logger.log(`QR gerado para usuário ${user.name}`);
        qrcode.generate(qr, { small: true });
        resolve({ qr, status: 'scan_required' });
      });

      client.on('auth_failure', async (msg) => {
        this.logger.error(`Falha de autenticação para ${userUuid}: ${msg}`);
        await this.disconnect(userUuid);
        await this.deleteSession(userUuid);
      });

      client.on('ready', async () => {
        this.logger.log(`WhatsApp conectado para usuário ${user.name}`);
      });

      client.on('disconnected', async () => {
        await this.disconnect(userUuid);
      });

      client.initialize().catch(reject);
      clients.set(userUuid, client);
    });
  }

  async disconnect(userUuid: string): Promise<void> {
    const client = clients.get(userUuid);
    if (!client)
      throw new NotFoundException(`No client found for user uuid ${userUuid}`);
    const connectionState = await client.getState();
    const clientState = await this.checkClientState(client);
    if (clientState !== 'CONNECTED') {
      new ConflictException(`The client is not yet connected.`);
    }
    await client.destroy();
    clients.delete(userUuid);
    const whatsappIntegration =
      await this.integrationsService.getUserIntegration(
        userUuid,
        undefined,
        'whatsapp',
      );
    await this.integrationsService.updateIntegrationStatus(
      userUuid,
      whatsappIntegration.id,
      { status: 'inactive' },
    );
    this.logger.log(`Cliente desconectado para ${userUuid}`);
  }

  async sendMessage(
    userUuid: string,
    dto: SendMessageDto,
  ): Promise<{ message: string }> {
    const client = clients.get(userUuid);
    if (!client) {
      throw new NotFoundException(`No client found for user uuid ${userUuid}`);
    }

    const chat = await client.getChatById(dto.chatId);
    if (!chat) {
      throw new NotFoundException(`No chat found for chat id ${dto.chatId}`);
    }

    try {
      let mentions: string[] = [];

      if (dto.options?.mentions) {
        const who = dto.options.mentions.who;

        if (Array.isArray(who)) {
          if (who.length === 0) {
            throw new BadRequestException(
              'There are no contacts in the mentions list',
            );
          }
          mentions = who;
        } else if (who === 'all') {
          if (chat.isGroup) {
            const groupChat = chat as GroupChat;
            mentions = groupChat.participants.map((participant) => {
              return participant.id._serialized;
            });
          }
        }
      }
      await client.sendMessage(dto.chatId, dto.message, { mentions });

      return { message: 'Mensagem enviada com sucesso' };
    } catch (err) {
      throw new ConflictException(
        `Não foi possível enviar mensagem. Motivo: ${err.message || err}`,
      );
    }
  }

  async getChats(userUuid: string) {
    const client = clients.get(userUuid);
    if (!client)
      throw new NotFoundException(`No client found for user uuid ${userUuid}`);
    const chats = await client.getChats();
    return chats;
  }
}
