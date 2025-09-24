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

  /**
   * Job: send-block
   * payload: { blockId }
   */
  @Process('send-block')
  async handleSendBlock(job: Job<{ blockId: number }>) {
    const { blockId } = job.data;
    this.logger.log(
      `Processing send-block job for block ${blockId} (job id ${job.id})`,
    );

    // Carrega bloco + rotina + mensagens + recipients (assumindo relations configuradas)
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

    // Checa status da rotina (pausada, finalizada)
    if (routine.status !== 'active') {
      this.logger.warn(
        `Routine ${routine.id} is not active (status=${routine.status}). Skipping block ${blockId}`,
      );
      return;
    }

    // lista de recipients: se o block tiver override, use, senão use routine.recipients
    const recipients =
      (block as any).recipients && (block as any).recipients.length
        ? (block as any).recipients
        : (routine.recipients ?? []);

    // sequência simples: para cada recipient, enviar mensagens na ordem
    for (const recipient of recipients) {
      for (const message of block.messages ?? []) {
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
          // dependendo da política, continue ou rethrow; aqui continuamos para próximos recipients/messages
        }
        // intervalo entre mensagens conforme rotina
        await this.sleep((routine.intervalSeconds || 1) * 1000);
      }
      // opcional: intervalo entre recipients (pode ser menor ou 0)
      await this.sleep(200); // pequeno gap
    }

    this.logger.log(`Block ${blockId} processed successfully`);
    // Ao final, se essa rotina for diária, re-agende o próximo envio do bloco (se aplicável)
    await this.rescheduleNextOccurrence(block);
  }

  private async rescheduleNextOccurrence(block: WhatsappRoutineBlock) {
    // Implementação simples: se rotina endAt undefined ou futura, calcule próxima triggerTime do bloco adicionando 1 dia
    const routine = (block as any).routine as WhatsappRoutine;
    if (!routine) return;

    if (routine.endAt && new Date() > new Date(routine.endAt)) {
      this.logger.log(
        `Routine ${routine.id} ended. Not rescheduling block ${block.id}`,
      );
      return;
    }

    // exemplo: se o bloco.triggerTime representa hora do dia, incremente 1 dia
    const next = new Date(block.triggerTime);
    next.setDate(next.getDate() + 1);

    // atualiza triggerTime na DB (opcional) ou apenas enfileira
    await this.dataSource
      .getRepository(WhatsappRoutineBlock)
      .update({ id: block.id }, { triggerTime: next });
    await this.queueService.enqueueBlock(block.id, next);
    this.logger.log(`Block ${block.id} rescheduled to ${next.toISOString()}`);
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
