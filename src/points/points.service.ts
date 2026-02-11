import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  UserPoints,
  PointTransaction,
  TransactionType,
  LoyaltyRule,
  LoyaltyRuleType,
} from '../database/entities';
import { CalculatePointsDto } from './dto/points.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserPoints)
    private userPointsRepository: Repository<UserPoints>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(LoyaltyRule)
    private loyaltyRuleRepository: Repository<LoyaltyRule>,
    private dataSource: DataSource,
  ) {}

  async calculatePoints(
    userId: string,
    clientId: string,
    calculatePointsDto: CalculatePointsDto,
  ): Promise<{ pointsEarned: number; newBalance: number }> {
    // Get active loyalty rules for client
    const rules = await this.loyaltyRuleRepository.find({
      where: { clientId, isActive: true },
    });

    if (rules.length === 0) {
      throw new BadRequestException('No active loyalty rules found for client');
    }

    let pointsEarned = 0;

    // Calculate points based on rules
    for (const rule of rules) {
      if (rule.type === LoyaltyRuleType.POINTS_PER_CURRENCY && rule.pointsPerCurrency) {
        pointsEarned += calculatePointsDto.orderValue * rule.pointsPerCurrency;
      }

      if (rule.type === LoyaltyRuleType.POINTS_PER_PURCHASE && rule.pointsPerPurchase) {
        pointsEarned += rule.pointsPerPurchase;
      }
    }

    // Round points to 2 decimal places
    pointsEarned = Math.round(pointsEarned * 100) / 100;

    // Add points to user account in a transaction
    const newBalance = await this.addPoints(
      userId,
      clientId,
      pointsEarned,
      `Points earned from order ${calculatePointsDto.orderId || 'N/A'}`,
      calculatePointsDto.orderId,
      calculatePointsDto.metadata,
    );

    return { pointsEarned, newBalance };
  }

  async addPoints(
    userId: string,
    clientId: string,
    amount: number,
    description: string,
    referenceId?: string,
    metadata?: Record<string, any>,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      // Get or create user points
      let userPoints = await manager.findOne(UserPoints, {
        where: { userId, clientId },
      });

      if (!userPoints) {
        userPoints = manager.create(UserPoints, {
          userId,
          clientId,
          balance: 0,
        });
      }

      // Update balance
      const newBalance = Number(userPoints.balance) + amount;
      userPoints.balance = newBalance;

      // Calculate expiry date if needed
      const rules = await manager.find(LoyaltyRule, {
        where: { clientId, isActive: true },
      });

      if (rules.length > 0 && rules[0].pointsExpiryDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + rules[0].pointsExpiryDays);
        userPoints.expiresAt = expiryDate;
      }

      await manager.save(userPoints);

      // Create transaction record
      const transaction = manager.create(PointTransaction, {
        userId,
        clientId,
        type: TransactionType.EARNED,
        amount,
        balanceAfter: newBalance,
        description,
        referenceId,
        metadata,
      });

      await manager.save(transaction);

      return newBalance;
    });
  }

  async deductPoints(
    userId: string,
    clientId: string,
    amount: number,
    description: string,
    referenceId?: string,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const userPoints = await manager.findOne(UserPoints, {
        where: { userId, clientId },
        lock: { mode: 'pessimistic_write' }, // Lock for update
      });

      if (!userPoints) {
        throw new BadRequestException('User has no points');
      }

      const currentBalance = Number(userPoints.balance);

      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient points balance');
      }

      const newBalance = currentBalance - amount;
      userPoints.balance = newBalance;

      await manager.save(userPoints);

      // Create transaction record
      const transaction = manager.create(PointTransaction, {
        userId,
        clientId,
        type: TransactionType.REDEEMED,
        amount: -amount,
        balanceAfter: newBalance,
        description,
        referenceId,
      });

      await manager.save(transaction);

      return newBalance;
    });
  }

  async getBalance(userId: string, clientId: string): Promise<UserPoints> {
    const userPoints = await this.userPointsRepository.findOne({
      where: { userId, clientId },
    });

    if (!userPoints) {
      const userPoints = new UserPoints();
      userPoints.userId = userId;
      userPoints.clientId = clientId;
      userPoints.balance = 0;
      userPoints.expiresAt = null as any;
      return userPoints;
    }

    return userPoints;
  }

  async getTransactionHistory(
    userId: string,
    clientId: string,
  ): Promise<PointTransaction[]> {
    return this.pointTransactionRepository.find({
      where: { userId, clientId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
