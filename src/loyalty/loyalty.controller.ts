import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { CreateLoyaltyRuleDto, UpdateLoyaltyRuleDto } from './dto/loyalty-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { GetClientId } from '../common/decorators/user.decorator';

@ApiTags('loyalty')
@Controller('loyalty/rules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Create a new loyalty rule' })
  create(
    @GetClientId() clientId: string,
    @Body() createLoyaltyRuleDto: CreateLoyaltyRuleDto,
  ) {
    return this.loyaltyService.create(clientId, createLoyaltyRuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loyalty rules for client' })
  findAll(@GetClientId() clientId: string) {
    return this.loyaltyService.findAll(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a loyalty rule by ID' })
  findOne(@Param('id') id: string, @GetClientId() clientId: string) {
    return this.loyaltyService.findOne(id, clientId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Update a loyalty rule' })
  update(
    @Param('id') id: string,
    @GetClientId() clientId: string,
    @Body() updateLoyaltyRuleDto: UpdateLoyaltyRuleDto,
  ) {
    return this.loyaltyService.update(id, clientId, updateLoyaltyRuleDto);
  }
}
