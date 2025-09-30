import { Module } from '@nestjs/common';
import { WhatsappRoutinesModule } from './whatsapp/whatsapp-routines.module';

@Module({
  imports: [WhatsappRoutinesModule],
  exports: [WhatsappRoutinesModule],
})
export class RoutinesModule {}
