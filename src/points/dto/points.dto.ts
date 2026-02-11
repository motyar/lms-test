import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, IsOptional, IsString } from 'class-validator';

export class CalculatePointsDto {
  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  orderValue: number;

  @ApiPropertyOptional({ example: 'ORDER-12345' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class PointsBalanceResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  expiresAt: Date | null;
}

export class PointsTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;
}
