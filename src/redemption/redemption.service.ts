import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThan } from 'typeorm';
import {
  Redemption,
  RedemptionStatus,
  Campaign,
  CampaignType,
  DiscountType,
  UserPoints,
} from '../database/entities';
import {
  ValidateRedemptionDto,
  ApplyRedemptionDto,
  RedemptionValidationResponseDto,
  RedemptionResponseDto,
} from './dto/redemption.dto';
import { PointsService } from '../points/points.service';

@Injectable()
export class RedemptionService {
  constructor(
    @InjectRepository(Redemption)
    private redemptionRepository: Repository<Redemption>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(UserPoints)
    private userPointsRepository: Repository<UserPoints>,
    private pointsService: PointsService,
    private dataSource: DataSource,
  ) {}

  async validateRedemption(
    clientId: string,
    validateDto: ValidateRedemptionDto,
  ): Promise<RedemptionValidationResponseDto> {
    try {
      // Get campaign with lock
      const campaign = await this.campaignRepository.findOne({
        where: { id: validateDto.campaignId, clientId },
      });

      if (!campaign) {
        return {
          isValid: false,
          message: 'Campaign not found',
        };
      }

      // Check campaign validity
      const now = new Date();
      if (now < campaign.startDate || now > campaign.endDate) {
        return {
          isValid: false,
          message: 'Campaign is not active in current date range',
        };
      }

      if (campaign.status !== 'active') {
        return {
          isValid: false,
          message: 'Campaign is not active',
        };
      }

      // Check global usage limit
      if (
        campaign.globalUsageLimit &&
        campaign.currentUsageCount >= campaign.globalUsageLimit
      ) {
        return {
          isValid: false,
          message: 'Campaign has reached its global usage limit',
        };
      }

      // Check user usage limit
      if (campaign.usageLimitPerUser) {
        const userRedemptions = await this.redemptionRepository.count({
          where: {
            campaignId: campaign.id,
            userId: validateDto.userId,
            status: RedemptionStatus.COMPLETED,
          },
        });

        if (userRedemptions >= campaign.usageLimitPerUser) {
          return {
            isValid: false,
            message: 'User has reached the usage limit for this campaign',
          };
        }
      }

      // Check cooldown period
      if (campaign.cooldownHours) {
        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - campaign.cooldownHours);

        const recentRedemption = await this.redemptionRepository.findOne({
          where: {
            campaignId: campaign.id,
            userId: validateDto.userId,
            status: RedemptionStatus.COMPLETED,
            createdAt: MoreThan(cooldownDate),
          },
          order: { createdAt: 'DESC' },
        });

        if (recentRedemption) {
          return {
            isValid: false,
            message: `Cooldown period active. Please wait ${campaign.cooldownHours} hours between redemptions`,
          };
        }
      }

      // Check minimum order value
      if (campaign.minOrderValue && validateDto.orderValue < Number(campaign.minOrderValue)) {
        return {
          isValid: false,
          message: `Order value must be at least ${campaign.minOrderValue}`,
        };
      }

      // Calculate discount based on campaign type
      let discountAmount = 0;
      let pointsRequired = 0;

      if (campaign.type === CampaignType.DISCOUNT_ORDER_BASED) {
        discountAmount = this.calculateDiscount(
          validateDto.orderValue,
          campaign.discountType,
          Number(campaign.discountValue),
          campaign.maxDiscountCap ? Number(campaign.maxDiscountCap) : undefined,
        );
      } else if (campaign.type === CampaignType.DISCOUNT_REWARD_BASED) {
        pointsRequired = campaign.pointsRequired || 0;

        // Check if user has enough points
        const userPoints = await this.userPointsRepository.findOne({
          where: { userId: validateDto.userId, clientId },
        });

        if (!userPoints || Number(userPoints.balance) < pointsRequired) {
          return {
            isValid: false,
            pointsRequired,
            message: 'Insufficient points for this redemption',
          };
        }

        discountAmount = Number(campaign.discountValue) || 0;
      }

      return {
        isValid: true,
        discountAmount,
        pointsRequired,
        message: 'Redemption is valid',
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'Validation failed',
      };
    }
  }

  async applyRedemption(
    clientId: string,
    applyDto: ApplyRedemptionDto,
  ): Promise<RedemptionResponseDto> {
    // Validate first
    const validation = await this.validateRedemption(clientId, applyDto);

    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }

    // Apply redemption in transaction
    return this.dataSource.transaction(async (manager) => {
      // Lock campaign for update
      const campaign = await manager.findOne(Campaign, {
        where: { id: applyDto.campaignId, clientId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      let pointsUsed = 0;
      let newBalance = 0;

      // Deduct points if needed
      if (campaign.type === CampaignType.DISCOUNT_REWARD_BASED) {
        pointsUsed = campaign.pointsRequired || 0;
        newBalance = await this.pointsService.deductPoints(
          applyDto.userId,
          clientId,
          pointsUsed,
          `Redeemed points for campaign: ${campaign.name}`,
          applyDto.orderId,
        );
      } else {
        // Get current balance
        const userPoints = await this.userPointsRepository.findOne({
          where: { userId: applyDto.userId, clientId },
        });
        newBalance = userPoints ? Number(userPoints.balance) : 0;
      }

      // Create redemption record
      const redemption = manager.create(Redemption, {
        userId: applyDto.userId,
        clientId,
        campaignId: campaign.id,
        status: RedemptionStatus.COMPLETED,
        pointsUsed,
        discountAmount: validation.discountAmount,
        orderValue: applyDto.orderValue,
        orderId: applyDto.orderId,
        metadata: applyDto.metadata,
      });

      await manager.save(redemption);

      // Update campaign usage count
      campaign.currentUsageCount += 1;
      await manager.save(campaign);

      return {
        redemptionId: redemption.id,
        discountAmount: validation.discountAmount || 0,
        pointsUsed,
        newPointsBalance: newBalance,
        status: RedemptionStatus.COMPLETED,
      };
    });
  }

  async getRedemptionHistory(
    userId: string,
    clientId: string,
  ): Promise<Redemption[]> {
    return this.redemptionRepository.find({
      where: { userId, clientId },
      relations: ['campaign'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  private calculateDiscount(
    orderValue: number,
    discountType: DiscountType,
    discountValue: number,
    maxCap?: number,
  ): number {
    let discount = 0;

    if (discountType === DiscountType.PERCENTAGE) {
      discount = (orderValue * discountValue) / 100;
    } else if (discountType === DiscountType.FIXED) {
      discount = discountValue;
    }

    // Apply cap if specified
    if (maxCap && discount > maxCap) {
      discount = maxCap;
    }

    // Ensure discount doesn't exceed order value
    if (discount > orderValue) {
      discount = orderValue;
    }

    return Math.round(discount * 100) / 100;
  }
}
