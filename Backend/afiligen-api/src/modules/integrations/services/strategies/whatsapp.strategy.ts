import { IntegrationsService } from '../integrations.service';
import { Client } from 'whatsapp-web.js';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/modules/users/user.service';
import * as qrcode from 'qrcode-terminal';
import { SendMessageDto } from '../../dtos/whatsapp-message.dto';
import { ConflictException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { GroupChat } from 'whatsapp-web.js';
import { group } from 'console';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private clients: Map<string, Client> = new Map();

  constructor(
    private integrationsService: IntegrationsService,
    private userService: UserService,
  ) {}

  async connect(userUuid: string): Promise<any> {
    const user = await this.userService.findOne(userUuid);
    if (!user)
      throw new NotFoundException(`User with uuid ${userUuid} not found`);

    if (this.clients.has(userUuid)) {
      this.logger.log(`Cliente já existente para usuário ${user.name}`);
      return { status: 'already_connected' };
    }

    const client = new Client({
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
    });

    return new Promise((resolve, reject) => {
      client.on('qr', async (qr) => {
        this.logger.log(`QR gerado para usuário ${user.name}`);
        qrcode.generate(qr, { small: true });
        resolve({ qr, status: 'scan_required' });
      });

      client.on('ready', async () => {
        this.logger.log(`WhatsApp conectado para usuário ${user.name}`);
      });

      client.on('disconnected', async () => {
        this.logger.warn(`WhatsApp desconectado para usuário ${user.name}`);
        await this.disconnect(userUuid);
      });

      client.initialize().catch(reject);
      this.clients.set(userUuid, client);
    });
  }

  async disconnect(userUuid: string): Promise<void> {
    const client = this.clients.get(userUuid);
    if (!client)
      throw new NotFoundException(`No client found for user uuid ${userUuid}`);
    this.logger.log(this.clients);
    await client.destroy();
    this.clients.delete(userUuid);
    this.logger.log(`Cliente desconectado para ${userUuid}`);
    this.logger.log(this.clients);
    this.logger.warn(`Nenhum cliente ativo encontrado para ${userUuid}`);
  }

  async sendMessage(
    userUuid: string,
    dto: SendMessageDto,
  ): Promise<{ message: string }> {
    const client = this.clients.get(userUuid);
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
    const client = this.clients.get(userUuid);
    if (!client)
      throw new NotFoundException(`No client found for user uuid ${userUuid}`);
    const chats = await client.getChats();
    return chats;
  }
}
