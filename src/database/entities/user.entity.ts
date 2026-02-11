export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  CLIENT_ADMIN = 'ClientAdmin',
  CLIENT_STAFF = 'ClientStaff',
  EXTERNAL_USER = 'ExternalUser',
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UserPoints } from './user-points.entity';
import { PointTransaction } from './point-transaction.entity';
import { Redemption } from './redemption.entity';

@Entity('users')
@Index(['email'])
@Index(['clientId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EXTERNAL_USER,
  })
  role: UserRole;

  @Column({ name: 'client_id', nullable: true })
  @Index()
  clientId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserPoints, (points) => points.user)
  points: UserPoints[];

  @OneToMany(() => PointTransaction, (transaction) => transaction.user)
  transactions: PointTransaction[];

  @OneToMany(() => Redemption, (redemption) => redemption.user)
  redemptions: Redemption[];
}
