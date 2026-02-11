export enum RedemptionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
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
import { User } from './user.entity';
import { Campaign } from './campaign.entity';

@Entity('redemptions')
@Index(['userId', 'clientId'])
@Index(['campaignId'])
@Index(['status'])
export class Redemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @Column({ name: 'campaign_id' })
  @Index()
  campaignId: string;

  @Column({
    type: 'enum',
    enum: RedemptionStatus,
    default: RedemptionStatus.PENDING,
  })
  status: RedemptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pointsUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  orderValue: number;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.redemptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Campaign, (campaign) => campaign.redemptions)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;
}
