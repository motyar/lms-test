export enum LoyaltyRuleType {
  POINTS_PER_CURRENCY = 'points_per_currency',
  POINTS_PER_PURCHASE = 'points_per_purchase',
  CUSTOM = 'custom',
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from './client.entity';

@Entity('loyalty_rules')
@Index(['clientId'])
export class LoyaltyRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LoyaltyRuleType,
  })
  type: LoyaltyRuleType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Points per currency spent (e.g., 1 point per $1)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pointsPerCurrency: number;

  // Points per purchase count
  @Column({ type: 'integer', nullable: true })
  pointsPerPurchase: number;

  // Points to currency conversion rate
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pointsToCurrencyRate: number;

  // Custom logic flag
  @Column({ type: 'boolean', default: false })
  useCustomLogic: boolean;

  // Points expiry in days
  @Column({ type: 'integer', nullable: true })
  pointsExpiryDays: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.loyaltyRules)
  @JoinColumn({ name: 'client_id' })
  client: Client;
}
