import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import {
  UserPoints,
  PointTransaction,
  LoyaltyRule,
  ApiKey,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPoints, PointTransaction, LoyaltyRule, ApiKey]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
