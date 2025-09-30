import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { WhatsappQueueProcessor } from './whatsapp-queue.processor';
import { WhatsappService } from 'src/modules/integrations/services/strategies/whatsapp.strategy';
import { RoutinesSchedulerService } from './whatsapp-scheduler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappRoutineBlock } from '../entities/whatsapp-routine-block';
import { WhatsappRoutine } from '../entities/whatsapp-routine.entity';
import { WhatsappMessage } from '../entities/whatsapp-message.entity.ts';
import { UserModule } from 'src/modules/users/user.module';
import { IntegrationsModule } from 'src/modules/integrations/integrations.module';
import { WhatsappRoutineBlocksService } from '../services/whatsapp-routine-block.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'whatsapp',
    }),
    TypeOrmModule.forFeature([
      WhatsappRoutine,
      WhatsappRoutineBlock,
      WhatsappMessage,
    ]),
    UserModule,
    IntegrationsModule,
  ],
  providers: [
    WhatsappQueueService,
    WhatsappQueueProcessor,
    RoutinesSchedulerService,
    WhatsappService,
    WhatsappRoutineBlocksService,
  ],
  exports: [WhatsappQueueService],
})
export class WhatsappQueueModule {}
