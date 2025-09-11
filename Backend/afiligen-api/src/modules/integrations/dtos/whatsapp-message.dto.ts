import { IsOptional, IsString } from 'class-validator';

interface SendMessageOption {
  mentions?: {
    who: string[] | 'all';
    explicitMention: boolean;
  };
}

export class SendMessageDto {
  @IsString()
  chatId: string;

  @IsString()
  message: string;

  @IsOptional()
  options?: SendMessageOption;
}
