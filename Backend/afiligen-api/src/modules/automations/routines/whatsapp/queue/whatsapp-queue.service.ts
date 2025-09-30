import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';

@Injectable()
export class WhatsappQueueService {
  private readonly logger = new Logger(WhatsappQueueService.name);

  constructor(@InjectQueue('whatsapp') private readonly whatsappQueue: Queue) {}

  async enqueueBlock(blockId: number, triggerAt: Date, payload?: any) {
    const triggerHour = triggerAt.getUTCHours();
    const triggerMinute = triggerAt.getUTCMinutes();
    const triggerSecond = triggerAt.getUTCSeconds();

    const now = new Date();

    const todayTrigger = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        triggerHour,
        triggerMinute,
        triggerSecond,
        0,
      ),
    );

    const delay = todayTrigger.getTime() - Date.now();

    /*this.logger.log(
      `${todayTrigger.toISOString()} (trigger) - ${now.toISOString()} (agora) = EXECUTA EM ${(delay / 1000 / 60).toFixed(2)} minutos`,
    );*/

    this.logger.log(
      `Enfileirando bloco ${blockId} para ${triggerAt.toISOString()} (delay ${delay}ms)`,
    );

    const job = await this.whatsappQueue.add(
      'send-block',
      {
        blockId,
        ...payload,
      },
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return job;
  }

  async pauseQueue() {
    await this.whatsappQueue.pause();
    this.logger.warn('Whatsapp queue paused');
  }

  async resumeQueue() {
    await this.whatsappQueue.resume();
    this.logger.log('Whatsapp queue resumed');
  }
}
