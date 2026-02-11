import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  Client,
  ApiKey,
  Campaign,
  LoyaltyRule,
  UserRole,
  CampaignType,
  DiscountType,
  CampaignStatus,
  LoyaltyRuleType,
} from '../entities';
import { randomBytes } from 'crypto';

async function seed() {
  console.log('🌱 Starting database seed...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // Create test client
    const clientRepo = dataSource.getRepository(Client);
    let client = await clientRepo.findOne({ where: { name: 'Test Client Corp' } });

    if (!client) {
      client = clientRepo.create({
        name: 'Test Client Corp',
        email: 'admin@testclient.com',
        isActive: true,
      });
      await clientRepo.save(client);
      console.log('✅ Created test client');
    }

    // Create API key for client
    const apiKeyRepo = dataSource.getRepository(ApiKey);
    const existingKey = await apiKeyRepo.findOne({
      where: { clientId: client.id },
    });

    if (!existingKey) {
      const apiKey = apiKeyRepo.create({
        key: `lms_${randomBytes(32).toString('hex')}`,
        clientId: client.id,
        description: 'Seed API Key',
        isActive: true,
      });
      await apiKeyRepo.save(apiKey);
      console.log(`✅ Created API Key: ${apiKey.key}`);
    }

    // Create super admin user
    const userRepo = dataSource.getRepository(User);
    let superAdmin = await userRepo.findOne({
      where: { email: 'admin@lms.com' },
    });

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      superAdmin = userRepo.create({
        email: 'admin@lms.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      await userRepo.save(superAdmin);
      console.log('✅ Created super admin: admin@lms.com / admin123');
    }

    // Create client admin user
    let clientAdmin = await userRepo.findOne({
      where: { email: 'clientadmin@testclient.com' },
    });

    if (!clientAdmin) {
      const hashedPassword = await bcrypt.hash('client123', 10);
      clientAdmin = userRepo.create({
        email: 'clientadmin@testclient.com',
        password: hashedPassword,
        firstName: 'Client',
        lastName: 'Admin',
        role: UserRole.CLIENT_ADMIN,
        clientId: client.id,
        isActive: true,
      });
      await userRepo.save(clientAdmin);
      console.log('✅ Created client admin: clientadmin@testclient.com / client123');
    }

    // Create test customer user
    let customer = await userRepo.findOne({
      where: { email: 'customer@example.com' },
    });

    if (!customer) {
      const hashedPassword = await bcrypt.hash('customer123', 10);
      customer = userRepo.create({
        email: 'customer@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Customer',
        role: UserRole.EXTERNAL_USER,
        clientId: client.id,
        isActive: true,
      });
      await userRepo.save(customer);
      console.log('✅ Created customer: customer@example.com / customer123');
    }

    // Create loyalty rules
    const loyaltyRuleRepo = dataSource.getRepository(LoyaltyRule);
    const existingRule = await loyaltyRuleRepo.findOne({
      where: { clientId: client.id },
    });

    if (!existingRule) {
      const rule = loyaltyRuleRepo.create({
        name: 'Points per Dollar',
        description: 'Earn 1 point for every dollar spent',
        type: LoyaltyRuleType.POINTS_PER_CURRENCY,
        clientId: client.id,
        pointsPerCurrency: 1,
        pointsToCurrencyRate: 0.01,
        pointsExpiryDays: 365,
        isActive: true,
      });
      await loyaltyRuleRepo.save(rule);
      console.log('✅ Created loyalty rule: Points per Dollar');
    }

    // Create sample campaigns
    const campaignRepo = dataSource.getRepository(Campaign);

    // Campaign 1: Order-based discount
    const campaign1Exists = await campaignRepo.findOne({
      where: { name: '10% Off Orders Above $100', clientId: client.id },
    });

    if (!campaign1Exists) {
      const campaign1 = campaignRepo.create({
        name: '10% Off Orders Above $100',
        description: 'Get 10% discount on orders above $100',
        type: CampaignType.DISCOUNT_ORDER_BASED,
        status: CampaignStatus.ACTIVE,
        clientId: client.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        minOrderValue: 100,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        maxDiscountCap: 50,
        usageLimitPerUser: 5,
        globalUsageLimit: 1000,
        isStackable: false,
      });
      await campaignRepo.save(campaign1);
      console.log('✅ Created campaign: 10% Off Orders Above $100');
    }

    // Campaign 2: Reward-based discount
    const campaign2Exists = await campaignRepo.findOne({
      where: { name: '$20 Off with 1000 Points', clientId: client.id },
    });

    if (!campaign2Exists) {
      const campaign2 = campaignRepo.create({
        name: '$20 Off with 1000 Points',
        description: 'Redeem 1000 points for $20 discount',
        type: CampaignType.DISCOUNT_REWARD_BASED,
        status: CampaignStatus.ACTIVE,
        clientId: client.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        pointsRequired: 1000,
        discountValue: 20,
        usageLimitPerUser: 10,
        cooldownHours: 24,
        isStackable: false,
      });
      await campaignRepo.save(campaign2);
      console.log('✅ Created campaign: $20 Off with 1000 Points');
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Super Admin: admin@lms.com / admin123');
    console.log('   Client Admin: clientadmin@testclient.com / client123');
    console.log('   Customer: customer@example.com / customer123\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seed();
