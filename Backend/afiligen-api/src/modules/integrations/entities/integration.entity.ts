import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/user.entity';
import { IntegrationCredential } from './integration-credentials.entity';
import { BaseEntity } from 'src/modules/common/entities/base.entity';

@Entity('integrations')
export class Integration extends BaseEntity {
  @ManyToOne(() => User, (user) => user.integrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  type: 'social' | 'marketplace';

  @Column()
  provider: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => IntegrationCredential, (cred) => cred.integration)
  credentials: IntegrationCredential[];
}
