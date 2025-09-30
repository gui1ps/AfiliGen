import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { WhatsappRoutineBlocksService } from '../services/whatsapp-routine-block.service';

@Injectable()
export class RoutinesSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RoutinesSchedulerService.name);
  private intervalRef: NodeJS.Timeout;

  constructor(
    private readonly dataSource: DataSource,
    private readonly queueService: WhatsappQueueService,
    private readonly blocksService: WhatsappRoutineBlocksService,
  ) {}

  async onModuleInit() {
    this.intervalRef = setInterval(() => this.scanAndSchedule(), 60 * 1000);
    this.scanAndSchedule().catch((err) => this.logger.error(err));
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async scanAndSchedule() {
    const windowMinutes = 2;
    const currentTimer = new Date();
    const windowEnd = new Date(
      currentTimer.getTime() + windowMinutes * 60 * 1000,
    );

    const startTimeUTC = currentTimer.toISOString().slice(11, 19);
    const endTimeUTC = windowEnd.toISOString().slice(11, 19);

    const blockRepo = this.dataSource.getRepository(WhatsappRoutineBlock);

    this.logger.log(
      `REALIZANDO SCAN => AGORA : ${startTimeUTC} ATÉ ${endTimeUTC}`,
    );

    const blocks = await blockRepo
      .createQueryBuilder('block')
      .where(
        `
      EXTRACT(HOUR FROM block.triggerTime AT TIME ZONE 'UTC') * 60 + 
      EXTRACT(MINUTE FROM block.triggerTime AT TIME ZONE 'UTC') 
      BETWEEN :startTime AND :endTime
      AND block.sent = false
      AND block.active = true`,

        {
          startTime: this.convertToMinutes(startTimeUTC),
          endTime: this.convertToMinutes(endTimeUTC),
        },
      )
      .leftJoinAndSelect('block.routine', 'routine')
      .leftJoinAndSelect('routine.user', 'user')
      .getMany();

    for (const block of blocks) {
      try {
        await this.queueService.enqueueBlock(block.id, block.triggerTime);
        await this.blocksService.update(block.id, { sent: true });
        this.logger.log(
          `Scheduled block ${block.id} at ${block.triggerTime.toDateString()}`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to schedule block ${block.id}: ${err.message || err}`,
        );
      }
    }
  }
}
