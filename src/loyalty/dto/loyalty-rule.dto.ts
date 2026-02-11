import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { LoyaltyRuleType } from '../../database/entities/loyalty-rule.entity';

export class CreateLoyaltyRuleDto {
  @ApiProperty({ example: 'Points per Dollar Spent' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Earn 1 point for every dollar spent' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: LoyaltyRuleType, example: LoyaltyRuleType.POINTS_PER_CURRENCY })
  @IsEnum(LoyaltyRuleType)
  @IsNotEmpty()
  type: LoyaltyRuleType;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsPerCurrency?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsPerPurchase?: number;

  @ApiPropertyOptional({ example: 0.01 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsToCurrencyRate?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  useCustomLogic?: boolean;

  @ApiPropertyOptional({ example: 365 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  pointsExpiryDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateLoyaltyRuleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsPerCurrency?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsPerPurchase?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsToCurrencyRate?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  useCustomLogic?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  pointsExpiryDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
