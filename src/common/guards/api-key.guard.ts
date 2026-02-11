import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../database/entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const keyRecord = await this.apiKeyRepository.findOne({
      where: { key: apiKey, isActive: true },
      relations: ['client'],
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      throw new UnauthorizedException('API key has expired');
    }

    if (!keyRecord.client.isActive) {
      throw new UnauthorizedException('Client is not active');
    }

    // Attach client info to request
    request.clientId = keyRecord.clientId;
    request.client = keyRecord.client;

    return true;
  }
}
