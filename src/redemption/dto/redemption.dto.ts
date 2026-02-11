import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class ValidateRedemptionDto {
  @ApiProperty({ example: 'campaign-uuid' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  orderValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ApplyRedemptionDto extends ValidateRedemptionDto {
  @ApiProperty({ example: 'ORDER-12345' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class RedemptionValidationResponseDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  discountAmount?: number;

  @ApiProperty()
  pointsRequired?: number;

  @ApiProperty()
  message: string;
}

export class RedemptionResponseDto {
  @ApiProperty()
  redemptionId: string;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  pointsUsed: number;

  @ApiProperty()
  newPointsBalance: number;

  @ApiProperty()
  status: string;
}
