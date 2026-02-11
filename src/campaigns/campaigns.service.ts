import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../database/entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async create(
    clientId: string,
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    // Validate dates
    const startDate = new Date(createCampaignDto.startDate);
    const endDate = new Date(createCampaignDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      clientId,
      startDate,
      endDate,
    });

    return this.campaignRepository.save(campaign);
  }

  async findAll(clientId: string): Promise<Campaign[]> {
    return this.campaignRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, clientId: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, clientId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(
    id: string,
    clientId: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id, clientId);

    // Validate dates if provided
    if (updateCampaignDto.startDate || updateCampaignDto.endDate) {
      const startDate = updateCampaignDto.startDate
        ? new Date(updateCampaignDto.startDate)
        : campaign.startDate;
      const endDate = updateCampaignDto.endDate
        ? new Date(updateCampaignDto.endDate)
        : campaign.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    Object.assign(campaign, updateCampaignDto);

    if (updateCampaignDto.startDate) {
      campaign.startDate = new Date(updateCampaignDto.startDate);
    }
    if (updateCampaignDto.endDate) {
      campaign.endDate = new Date(updateCampaignDto.endDate);
    }

    return this.campaignRepository.save(campaign);
  }

  async delete(id: string, clientId: string): Promise<void> {
    const campaign = await this.findOne(id, clientId);
    await this.campaignRepository.remove(campaign);
  }

  async checkCampaignValidity(campaign: Campaign): Promise<boolean> {
    const now = new Date();

    if (campaign.status !== CampaignStatus.ACTIVE) {
      return false;
    }

    if (now < campaign.startDate || now > campaign.endDate) {
      return false;
    }

    if (
      campaign.globalUsageLimit &&
      campaign.currentUsageCount >= campaign.globalUsageLimit
    ) {
      return false;
    }

    return true;
  }
}
