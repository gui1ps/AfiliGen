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
} from 'class-validator';

import { Type } from 'class-transformer';

class Message {
  @IsEnum(['text', 'media'])
  type: 'text' | 'media';

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

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

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => Message)
  messages: Message[];
}
