import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionService } from './redemption.service';
import { RedemptionController } from './redemption.controller';
import {
  Redemption,
  Campaign,
  UserPoints,
  ApiKey,
  PointTransaction,
  LoyaltyRule,
} from '../database/entities';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Redemption,
      Campaign,
      UserPoints,
      ApiKey,
      PointTransaction,
      LoyaltyRule,
    ]),
    PointsModule,
  ],
  controllers: [RedemptionController],
  providers: [RedemptionService],
  exports: [RedemptionService],
})
export class RedemptionModule {}
