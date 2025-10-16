import { IntegrationsService } from '../integrations.service';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
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
import { WhatsappMessage } from 'src/modules/automations/routines/whatsapp/entities/whatsapp-message.entity.ts';
import { GroupChat } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendMessageDto } from '../../dtos/whatsapp-message.dto';
import { resolveMediaPath } from 'src/utils/media-path-resolver';

const clients: Map<string, Client> = new Map();

@Injectable()
export class WhatsappService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectRepository(WhatsappMessage)
    private messagesRepo: Repository<WhatsappMessage>,

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

  async iterateSessionFiles(callback: (folderPath: string) => Promise<void>) {
    const sessionsDir = path.join(process.cwd(), '.wwebjs_auth');
    if (fs.existsSync(sessionsDir)) {
      const sessionFolders = fs.readdirSync(sessionsDir);
      if (sessionFolders.length === 0) return;
      for (const folder of sessionFolders) {
        const folderPath = path.join(sessionsDir, folder);
        await callback(folderPath);
      }
    }
  }

  async onModuleInit() {
    this.logger.log('Apagando sessões antigas');
    await this.iterateSessionFiles(async (folderPath) => {
      const splitedPath = folderPath.split('/');
      const userUuid = splitedPath[splitedPath.length - 1].replace(
        'session-',
        '',
      );
      await this.deleteSession(userUuid);
    });
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

    await this.deleteSession(userUuid);

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
          dataPath: path.join(process.cwd(), '.wwebjs_auth'),
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
        clients.set(userUuid, client);
        this.logger.log(`WhatsApp conectado para usuário ${user.name}`);
      });

      client.on('disconnected', async () => {
        await this.disconnect(userUuid);
      });

      client.initialize().catch(reject);
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
      let media: MessageMedia | undefined = undefined;

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

      if (dto.message.mediaPath) {
        const img = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/webp',
        ];
        const video = ['video/mp4', 'video/mov', 'video/webm', 'video/mkv'];
        let fileType: 'img' | 'video' = 'img';
        const mimeType = dto.message.mimeType;
        if (mimeType) {
          if (img.includes(mimeType)) {
            fileType = 'img';
          } else if (video.includes(mimeType)) {
            fileType = 'video';
          }
        }
        const solvedMedia = await resolveMediaPath(
          dto.message.mediaPath,
          'whatsapp',
          fileType,
        );
        if (!solvedMedia)
          throw new BadRequestException(
            'Could not retrieve the requested media file',
          );
        const mediaAbsPath = solvedMedia.absPath;
        media = MessageMedia.fromFilePath(mediaAbsPath);
      }

      await client.sendMessage(dto.chatId, dto.message.content, {
        mentions,
        media,
      });

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
    try {
      const chats = await client.getChats();
      return chats;
    } catch (error) {
      throw new ConflictException('Unable to retrieve contacts');
    }
  }
}
