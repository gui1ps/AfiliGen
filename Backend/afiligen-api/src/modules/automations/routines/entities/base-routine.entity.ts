import {
  Column,
  Entity,
  TableInheritance,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { User } from 'src/modules/users/user.entity';
import { BaseChatAppRoutineBlock } from './base-chat-app-routine-block';

@Entity('routines')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BaseRoutineEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: 'active' })
  status: 'active' | 'paused' | 'finished';

  @Column({ type: 'timestamptz' })
  startAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endAt?: Date;

  @Column({ type: 'int' })
  intervalSeconds: number;

  @Column({ default: 'single' })
  mode: 'single' | 'batch' | 'sequential';

  @ManyToOne(() => User, (user) => user.routines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => BaseChatAppRoutineBlock, (block) => block.routine)
  chatAppMessageBlock: BaseChatAppRoutineBlock[];
}
