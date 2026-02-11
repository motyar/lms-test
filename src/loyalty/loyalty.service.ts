import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyRule } from '../database/entities/loyalty-rule.entity';
import { CreateLoyaltyRuleDto, UpdateLoyaltyRuleDto } from './dto/loyalty-rule.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyRule)
    private loyaltyRuleRepository: Repository<LoyaltyRule>,
  ) {}

  async create(
    clientId: string,
    createLoyaltyRuleDto: CreateLoyaltyRuleDto,
  ): Promise<LoyaltyRule> {
    // Validate rule configuration
    this.validateRule(createLoyaltyRuleDto);

    const rule = this.loyaltyRuleRepository.create({
      ...createLoyaltyRuleDto,
      clientId,
    });

    return this.loyaltyRuleRepository.save(rule);
  }

  async findAll(clientId: string): Promise<LoyaltyRule[]> {
    return this.loyaltyRuleRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, clientId: string): Promise<LoyaltyRule> {
    const rule = await this.loyaltyRuleRepository.findOne({
      where: { id, clientId },
    });

    if (!rule) {
      throw new NotFoundException('Loyalty rule not found');
    }

    return rule;
  }

  async update(
    id: string,
    clientId: string,
    updateLoyaltyRuleDto: UpdateLoyaltyRuleDto,
  ): Promise<LoyaltyRule> {
    const rule = await this.findOne(id, clientId);

    // Validate if any rule values are being updated
    if (
      updateLoyaltyRuleDto.pointsPerCurrency !== undefined ||
      updateLoyaltyRuleDto.pointsPerPurchase !== undefined ||
      updateLoyaltyRuleDto.pointsToCurrencyRate !== undefined
    ) {
      this.validateRule({ ...rule, ...updateLoyaltyRuleDto } as any);
    }

    Object.assign(rule, updateLoyaltyRuleDto);

    return this.loyaltyRuleRepository.save(rule);
  }

  private validateRule(rule: CreateLoyaltyRuleDto | any): void {
    // Ensure at least one rule is configured
    const hasRule =
      rule.pointsPerCurrency > 0 ||
      rule.pointsPerPurchase > 0 ||
      rule.pointsToCurrencyRate > 0 ||
      rule.useCustomLogic;

    if (!hasRule) {
      throw new BadRequestException(
        'At least one loyalty rule configuration is required',
      );
    }
  }
}
