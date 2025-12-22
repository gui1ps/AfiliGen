import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { WhatsappRoutine } from '../entities/whatsapp-routine.entity';
import { WhatsappMessage } from '../entities/whatsapp-message.entity.ts';
import { WhatsappService } from 'src/modules/integrations/services/strategies/whatsapp.strategy';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { InjectRepository } from '@nestjs/typeorm';

@Processor('whatsapp')
@Injectable()
export class WhatsappQueueProcessor {
  private readonly logger = new Logger(WhatsappQueueProcessor.name);

  constructor(
    private readonly sender: WhatsappService,
    private readonly queueService: WhatsappQueueService,

    @InjectRepository(WhatsappRoutineBlock)
    private readonly blockRepo: Repository<WhatsappRoutineBlock>,

    @InjectRepository(WhatsappMessage)
    private readonly messagesRepo: Repository<WhatsappMessage>,
  ) {}

  @Process('send-block')
  async handleSendBlock(job: Job<{ blockId: number }>) {
    const { blockId } = job.data;
    this.logger.log(
      `Processing send-block job for block ${blockId} (job id ${job.id})`,
    );

    const block = await this.blockRepo.findOne({
      where: { id: blockId },
      relations: ['routine', 'messages', 'routine.user', 'routine.messages'],
    });

    if (!block) {
      this.logger.error(`Block ${blockId} not found`);
      throw new NotFoundException('Block not found');
    }

    const routine = block.routine as WhatsappRoutine;
    if (!routine) {
      this.logger.error(`Routine not found for block ${blockId}`);
      throw new NotFoundException('Routine not found');
    }

    this.logger.log(JSON.stringify(routine.messages));

    if (routine.status !== 'active') {
      this.logger.warn(
        `Routine ${routine.id} is not active (status=${routine.status}). Skipping block ${blockId}`,
      );
      return;
    }

    const messages = routine.messages ?? [];
    const recipients = routine.recipients ?? [];

    const startIndex = routine.lastSentMessageIndex + 1;
    const maxMessages = routine.maxMessagesPerBlock;

    if (startIndex >= messages.length) {
      this.logger.log(`No more messages to send for block ${blockId}`);
      return;
    }

    const messagesToSend = messages.slice(startIndex, startIndex + maxMessages);

    this.logger.log(`LISTA DE MENSAGEM TOTAL: ${JSON.stringify(messages)}`);
    this.logger.log(
      `LISTA DE MENSAGEM A ENVIAR: ${JSON.stringify(messagesToSend)}`,
    );

    for (const message of messagesToSend) {
      for (const recipient of recipients) {
        try {
          await this.sender.sendMessage(routine.user.uuid, {
            chatId: recipient,
            message: message,
          });
          message.status = 'sent';
          await this.messagesRepo.save(message);
        } catch (err) {
          this.logger.error(
            `Failed to send message ${message.id} to ${recipient}: ${err.message || err}`,
          );
          message.status = 'failed';
          await this.messagesRepo.save(message);
        }
      }
      await this.sleep((routine.intervalSeconds || 1) * 1000);
    }

    routine.lastSentMessageIndex = startIndex + messagesToSend.length - 1;

    this.logger.log(`Block ${blockId} processed successfully`);
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
