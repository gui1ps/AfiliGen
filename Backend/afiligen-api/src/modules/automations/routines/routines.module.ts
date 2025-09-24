import { Module } from '@nestjs/common';
import { WhatsappRoutinesModule } from './whatsapp/whatsapp-routines.module';
import { BaseChatAppRoutineBlock } from './entities/base-chat-app-routine-block';
import { WhatsappQueueModule } from './whatsapp/queue/whatsapp-queue.module';

@Module({
  imports: [WhatsappRoutinesModule],
  exports: [WhatsappRoutinesModule],
})
export class RoutinesModule {}
