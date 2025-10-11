import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  ArrayNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateNested,
  IsPositive,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CreateWhatsappMessageDto } from './create-whatsapp-message.dto';

export class CreateWhatsappRoutineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['active', 'paused', 'finished'])
  @IsOptional()
  status?: 'active' | 'paused' | 'finished';

  @IsDateString()
  startAt: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsInt()
  @Min(300)
  intervalSeconds: number;

  @IsEnum(['single', 'batch', 'sequential'])
  @IsOptional()
  mode?: 'single' | 'batch' | 'sequential';

  @IsArray()
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  recipients: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateWhatsappMessageDto)
  messages?: CreateWhatsappMessageDto[];

  @IsPositive()
  @IsOptional()
  maxMessagesPerBlock?: number;
}
