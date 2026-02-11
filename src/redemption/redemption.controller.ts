import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { RedemptionService } from './redemption.service';
import {
  ValidateRedemptionDto,
  ApplyRedemptionDto,
} from './dto/redemption.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetClientId } from '../common/decorators/user.decorator';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('redemption')
@Controller('redeem')
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @Post('validate')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Validate a redemption (API key required)' })
  async validate(
    @Body() validateDto: ValidateRedemptionDto,
    @GetClientId() clientId: string,
  ) {
    return this.redemptionService.validateRedemption(clientId, validateDto);
  }

  @Post('apply')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Apply a redemption (API key required)' })
  async apply(
    @Body() applyDto: ApplyRedemptionDto,
    @GetClientId() clientId: string,
  ) {
    return this.redemptionService.applyRedemption(clientId, applyDto);
  }

  @Get('history/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get redemption history for a user' })
  async getHistory(
    @Param('userId') userId: string,
    @GetClientId() clientId: string,
  ) {
    return this.redemptionService.getRedemptionHistory(userId, clientId);
  }
}
