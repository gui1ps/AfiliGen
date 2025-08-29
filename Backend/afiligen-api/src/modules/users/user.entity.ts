import { Entity, Column, Generated } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: String, unique: true, nullable: true })
  password: string | null;

  @Column({ default: 'local' })
  provider: string;

  @Column({ default: 'user' })
  role: string;
}
