import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiKey } from './api-key.entity';
import { Campaign } from './campaign.entity';
import { LoyaltyRule } from './loyalty-rule.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.client)
  apiKeys: ApiKey[];

  @OneToMany(() => Campaign, (campaign) => campaign.client)
  campaigns: Campaign[];

  @OneToMany(() => LoyaltyRule, (rule) => rule.client)
  loyaltyRules: LoyaltyRule[];
}
