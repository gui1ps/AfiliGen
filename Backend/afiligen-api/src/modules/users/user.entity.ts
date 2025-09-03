import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Integration } from '../integrations/entities/integration.entity';

@Entity('users')
export class User extends BaseEntity {
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

  @OneToMany(() => Integration, (integration) => integration.user)
  integrations: Integration[];
}
