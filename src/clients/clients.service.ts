import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import { ApiKey } from '../database/entities/api-key.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existingClient = await this.clientRepository.findOne({
      where: { name: createClientDto.name },
    });

    if (existingClient) {
      throw new BadRequestException('Client with this name already exists');
    }

    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['apiKeys'],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async generateApiKey(
    clientId: string,
    description?: string,
  ): Promise<ApiKey> {
    const client = await this.findOne(clientId);

    const key = `lms_${randomBytes(32).toString('hex')}`;

    const apiKey = this.apiKeyRepository.create({
      key,
      clientId: client.id,
      description: description || 'Generated API key',
      isActive: true,
    });

    return this.apiKeyRepository.save(apiKey);
  }
}
