import { Module } from '@nestjs/common';
import { WhatsappRoutinesModule } from './whatsapp/whatsapp-routines.module';
import { BaseChatAppRoutineBlock } from './entities/base-chat-app-routine-block';

@Module({
  imports: [WhatsappRoutinesModule],
  exports: [WhatsappRoutinesModule],
})
export class RoutinesModule {}
