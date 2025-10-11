import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsNotEmpty,
  ValidateNested,
  ArrayNotEmpty,
  IsPositive,
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

export class UpdateWhatsappRoutineDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['active', 'paused', 'finished'])
  @IsOptional()
  status?: 'active' | 'paused' | 'finished';

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsInt()
  @Min(300)
  @IsOptional()
  intervalSeconds?: number;

  @IsEnum(['single', 'batch', 'sequential'])
  @IsOptional()
  mode?: 'single' | 'batch' | 'sequential';

  @IsArray()
  @IsOptional()
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  recipients?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  @Type(() => Message)
  messages: Message[];

  @IsPositive()
  @IsOptional()
  last_sent_message_index?: number;

  @IsPositive()
  @IsOptional()
  max_messages_per_block?: number;
}
