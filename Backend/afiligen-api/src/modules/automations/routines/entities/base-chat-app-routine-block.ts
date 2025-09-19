import {
  Column,
  Entity,
  TableInheritance,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { BaseRoutineEntity } from './base-routine.entity';

@Entity('chat_app__routine_blocks')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BaseChatAppRoutineBlock extends BaseEntity {
  @ManyToOne(
    () => BaseRoutineEntity,
    (routine) => routine.chatAppMessageBlock,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'routine_id' })
  routine: BaseRoutineEntity;

  @Column({ type: 'timestamptz' })
  triggerTime: Date;
}
