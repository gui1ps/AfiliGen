import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { WhatsappRoutine } from '../entities/whatsapp-routine.entity';
import { WhatsappMessage } from '../entities/whatsapp-message.entity.ts';
import { WhatsappService } from 'src/modules/integrations/services/strategies/whatsapp.strategy';
import { WhatsappQueueService } from './whatsapp-queue.service';

@Processor('whatsapp')
@Injectable()
export class WhatsappQueueProcessor {
  private readonly logger = new Logger(WhatsappQueueProcessor.name);

  constructor(
    private dataSource: DataSource,
    private readonly sender: WhatsappService,
    private readonly queueService: WhatsappQueueService,
  ) {}

  @Process('send-block')
  async handleSendBlock(job: Job<{ blockId: number }>) {
    const { blockId } = job.data;
    this.logger.log(
      `Processing send-block job for block ${blockId} (job id ${job.id})`,
    );

    const block = await this.dataSource
      .getRepository(WhatsappRoutineBlock)
      .findOne({
        where: { id: blockId },
        relations: ['routine', 'messages', 'routine.user'],
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

    if (routine.status !== 'active') {
      this.logger.warn(
        `Routine ${routine.id} is not active (status=${routine.status}). Skipping block ${blockId}`,
      );
      return;
    }

    const recipients =
      (block as any).recipients && (block as any).recipients.length
        ? (block as any).recipients
        : (routine.recipients ?? []);

    // sequência simples: para cada recipient, enviar mensagens na ordem
    for (const message of block.messages ?? []) {
      for (const recipient of recipients) {
        try {
          if (message.type === 'text') {
            await this.sender.sendMessage(routine.user.uuid, {
              chatId: recipient,
              message: message.content,
            });
          }
          /*} else {
            await this.sender.sendMedia(
              routine.user.uuid,
              recipient,
              message.content,
              message.mimeType,
              message.caption,
            );
          }*/
          // atualizar status da message (opcional: por mensagem por recipient? aqui atualiza entidade message como 'sent')
          message.status = 'sent';
          await this.dataSource.getRepository(WhatsappMessage).save(message);
        } catch (err) {
          this.logger.error(
            `Failed to send message ${message.id} to ${recipient}: ${err.message || err}`,
          );
          message.status = 'failed';
          await this.dataSource.getRepository(WhatsappMessage).save(message);
        }
      }
      await this.sleep((routine.intervalSeconds || 1) * 1000);
    }

    this.logger.log(`Block ${blockId} processed successfully`);
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
