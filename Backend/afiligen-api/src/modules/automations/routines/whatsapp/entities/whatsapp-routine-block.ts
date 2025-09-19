import { BaseChatAppRoutineBlock } from '../../entities/base-chat-app-routine-block';
import { ChildEntity, OneToMany } from 'typeorm';
import { WhatsappMessage } from './whatsapp-message.entity.ts';
import { IsInt } from 'class-validator';

@ChildEntity('whatsapp')
export class WhatsappRoutineBlock extends BaseChatAppRoutineBlock {
  @OneToMany(() => WhatsappMessage, (message) => message.block, {
    cascade: true,
  })
  messages: WhatsappMessage[];

  @IsInt()
  maximumNumberOfRoutineMessages: number;
}
