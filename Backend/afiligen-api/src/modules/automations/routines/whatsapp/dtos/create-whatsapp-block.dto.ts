import { IsDateString } from 'class-validator';

export class CreateWhatsappBlockDto {
  @IsDateString()
  triggerTime: Date;
}
