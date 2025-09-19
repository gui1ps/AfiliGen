import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateWhatsappMessageDto {
  @IsEnum(['text', 'media'])
  type: 'text' | 'media';

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
