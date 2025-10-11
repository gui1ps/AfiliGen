import { IsDateString, IsNumber } from 'class-validator';

export class CreateWhatsappBlockDto {
  @IsDateString()
  triggerTime: Date;

  @IsNumber()
  routineId: number;
}
