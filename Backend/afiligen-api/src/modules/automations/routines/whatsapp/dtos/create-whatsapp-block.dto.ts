import { IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWhatsappMessageDto } from './create-whatsapp-message.dto';

export class CreateWhatsappBlockDto {
  @IsDateString()
  triggerTime: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWhatsappMessageDto)
  messages: CreateWhatsappMessageDto[];
}
