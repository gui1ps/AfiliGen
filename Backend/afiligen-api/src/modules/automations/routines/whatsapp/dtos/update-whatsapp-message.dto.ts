import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateWhatsappMessageDto } from './create-whatsapp-message.dto';

export class UpdateWhatsappMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaPath?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsEnum(['pending', 'sent', 'failed'])
  status?: 'pending' | 'sent' | 'failed';
}
