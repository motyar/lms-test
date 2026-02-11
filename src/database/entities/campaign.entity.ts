export enum CampaignType {
  DISCOUNT_ORDER_BASED = 'discount_order_based',
  DISCOUNT_REWARD_BASED = 'discount_reward_based',
  LOYALTY = 'loyalty',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
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
  OneToMany,
} from 'typeorm';
import { Client } from './client.entity';
import { Redemption } from './redemption.entity';

@Entity('campaigns')
@Index(['clientId'])
@Index(['status'])
export class Campaign {
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
    enum: CampaignType,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  // For discount campaigns
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderValue: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountCap: number;

  // For reward-based discount
  @Column({ type: 'integer', nullable: true })
  pointsRequired: number;

  // Usage limits
  @Column({ type: 'integer', nullable: true })
  usageLimitPerUser: number;

  @Column({ type: 'integer', nullable: true })
  globalUsageLimit: number;

  @Column({ type: 'integer', default: 0 })
  currentUsageCount: number;

  // Stackability
  @Column({ type: 'boolean', default: false })
  isStackable: boolean;

  // Cooldown in hours
  @Column({ type: 'integer', nullable: true })
  cooldownHours: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.campaigns)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => Redemption, (redemption) => redemption.campaign)
  redemptions: Redemption[];
}
