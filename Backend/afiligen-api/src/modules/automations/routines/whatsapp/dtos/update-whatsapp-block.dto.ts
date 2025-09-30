import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateWhatsappBlockDto {
  @IsOptional()
  @IsDateString()
  triggerTime?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  sent?: boolean;
}
