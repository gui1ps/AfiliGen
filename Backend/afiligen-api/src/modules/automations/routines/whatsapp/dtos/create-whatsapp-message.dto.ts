import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateWhatsappMessageDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  mediaPath?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
