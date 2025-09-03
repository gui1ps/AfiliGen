import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Integration } from './integration.entity';
import { BaseEntity } from 'src/modules/common/entities/base.entity';

@Entity('integration_credentials')
export class IntegrationCredential extends BaseEntity {
  @ManyToOne(() => Integration, (integration) => integration.credentials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'integration_id' })
  integration: Integration;

  @Column()
  key: string;

  @Column('text')
  value: string;
}
