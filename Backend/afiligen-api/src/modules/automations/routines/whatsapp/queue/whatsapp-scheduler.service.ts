import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { DataSource, Between } from 'typeorm';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { WhatsappQueueService } from './whatsapp-queue.service';

@Injectable()
export class RoutinesSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RoutinesSchedulerService.name);
  private intervalRef: NodeJS.Timeout;

  constructor(
    private readonly dataSource: DataSource,
    private readonly queueService: WhatsappQueueService,
  ) {}

  async onModuleInit() {
    // iniciar scheduler a cada 60s
    this.intervalRef = setInterval(() => this.scanAndSchedule(), 60 * 1000);
    // também rodar imediatamente uma primeira vez
    this.scanAndSchedule().catch((err) => this.logger.error(err));
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  /**
   * Busca blocos cujos triggerTime esteja nos próximos N minutos e que não tenham sido agendados.
   * Para simplificar, vamos buscar blocos com triggerTime entre now e now + window (ex: 2 minutos).
   * Você pode melhorar marcando um campo scheduledAt para evitar re-enqueue duplicado.
   */
  async scanAndSchedule() {
    const windowMinutes = 2;
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

    const blockRepo = this.dataSource.getRepository(WhatsappRoutineBlock);
    const blocks = await blockRepo.find({
      where: {
        triggerTime: Between(now, windowEnd),
      },
      relations: ['routine', 'routine.user'],
    });

    for (const block of blocks) {
      // Você pode adicionar lógica para evitar re-enfileirar caso já exista job (verificação por jobId).
      try {
        await this.queueService.enqueueBlock(block.id, block.triggerTime);
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
