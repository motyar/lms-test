import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import {
  CampaignType,
  DiscountType,
  CampaignStatus,
} from '../../database/entities/campaign.entity';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale Campaign' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Get 20% off on orders above $100' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CampaignType, example: CampaignType.DISCOUNT_ORDER_BASED })
  @IsEnum(CampaignType)
  @IsNotEmpty()
  type: CampaignType;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountCap?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsRequired?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  globalUsageLimit?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isStackable?: boolean;

  @ApiPropertyOptional({ example: 24 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cooldownHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ example: 'Updated Campaign Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountCap?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  pointsRequired?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  globalUsageLimit?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isStackable?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  cooldownHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
