import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { CalculatePointsDto } from './dto/points.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetClientId, GetUser } from '../common/decorators/user.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('calculate')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Calculate and add points for an order (API key required)' })
  async calculatePoints(
    @Body() calculatePointsDto: CalculatePointsDto,
    @Body('userId') userId: string,
    @GetClientId() clientId: string,
  ) {
    return this.pointsService.calculatePoints(
      userId,
      clientId,
      calculatePointsDto,
    );
  }

  @Get('users/:id/points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user points balance' })
  async getBalance(@Param('id') userId: string, @GetClientId() clientId: string) {
    return this.pointsService.getBalance(userId, clientId);
  }

  @Get('users/:id/points/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user points transaction history' })
  async getHistory(@Param('id') userId: string, @GetClientId() clientId: string) {
    return this.pointsService.getTransactionHistory(userId, clientId);
  }
}
