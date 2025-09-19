import { Column, ChildEntity, OneToMany } from 'typeorm';
import { BaseRoutineEntity } from '../../entities/base-routine.entity';
import { WhatsappMessage } from './whatsapp-message.entity.ts';

@ChildEntity('whatsapp')
export class WhatsappRoutine extends BaseRoutineEntity {
  @OneToMany(() => WhatsappMessage, (message) => message.routine, {
    cascade: true,
  })
  messages: WhatsappMessage[];

  @Column('text', { array: true })
  recipients: string[];
}
