import { IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWhatsappMessageDto } from './create-whatsapp-message.dto';

export class CreateWhatsappBlockDto {
  @IsDateString()
  triggerTime: Date;
}
