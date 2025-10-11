import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { WhatsappRoutineBlock } from './whatsapp-routine-block';
import { WhatsappRoutine } from './whatsapp-routine.entity';

@Entity('whatsapp_messages')
export class WhatsappMessage extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  mediaPath?: string;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({ nullable: true })
  caption?: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'sent' | 'failed';

  @ManyToOne(() => WhatsappRoutineBlock, (block) => block.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'block_id' })
  block: WhatsappRoutineBlock;

  @ManyToOne(() => WhatsappRoutine, (routine) => routine.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routine_id' })
  routine: WhatsappRoutine;
}
