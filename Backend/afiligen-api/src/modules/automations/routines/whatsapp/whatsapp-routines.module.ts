import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappRoutine } from './entities/whatsapp-routine.entity';
import { WhatsappRoutinesService } from './services/whatsapp-routines.service';
import { WhatsappRoutinesController } from './controllers/whatsapp-routines.controller';
import { UserModule } from 'src/modules/users/user.module';
import { BaseRoutineEntity } from '../entities/base-routine.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity.ts';
import { BaseChatAppRoutineBlock } from '../entities/base-chat-app-routine-block';
import { WhatsappRoutineBlock } from './entities/whatsapp-routine-block';
import { WhatsappQueueModule } from './queue/whatsapp-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappRoutine,
      BaseRoutineEntity,
      WhatsappMessage,
      BaseChatAppRoutineBlock,
      WhatsappRoutineBlock,
      WhatsappQueueModule,
    ]),
    UserModule,
  ],
  providers: [WhatsappRoutinesService],
  controllers: [WhatsappRoutinesController],
  exports: [WhatsappRoutinesService],
})
export class WhatsappRoutinesModule {}
