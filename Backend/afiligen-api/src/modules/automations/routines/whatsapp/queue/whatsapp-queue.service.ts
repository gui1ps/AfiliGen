import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';

@Injectable()
export class WhatsappQueueService {
  private readonly logger = new Logger(WhatsappQueueService.name);

  constructor(@InjectQueue('whatsapp') private readonly whatsappQueue: Queue) {}

  async enqueueBlock(blockId: number, triggerAt: Date, payload?: any) {
    //const exampĺeDate = new Date('2025-09-23 10:31:00-03');
    //this.logger.log(exampĺeDate.toDateString());

    const delay = Math.max(0, triggerAt.getTime() - Date.now());
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
