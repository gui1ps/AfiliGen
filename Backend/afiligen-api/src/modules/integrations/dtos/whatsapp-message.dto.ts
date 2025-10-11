import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsArray,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { CreateWhatsappMessageDto } from 'src/modules/automations/routines/whatsapp/dtos/create-whatsapp-message.dto';

interface SendMessageOption {
  mentions?: {
    who: string[] | 'all';
    explicitMention: boolean;
  };
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ValidateNested()
  @Type(() => CreateWhatsappMessageDto)
  message: CreateWhatsappMessageDto;

  @IsOptional()
  options?: SendMessageOption;
}
