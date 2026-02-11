# LMS API Quick Start Guide

## Overview

This Loyalty Management System (LMS) provides a complete backend solution for managing loyalty programs, points, campaigns, and redemptions with multi-tenant support.

## Key Features

### 1. Multi-Tenant Architecture
- Each client (merchant) has isolated data
- Automatic tenant-scoping on all queries
- API keys and JWT tokens are client-specific

### 2. Authentication Methods

#### JWT Authentication (for internal users)
Used by: Super Admins, Client Admins, Staff
- Login with email/password
- Get access token + refresh token
- Use Bearer token for API requests

#### API Key Authentication (for third-party integrations)
Used by: External systems, e-commerce platforms
- Generate API keys per client
- Use `x-api-key` header for API requests
- Ideal for server-to-server communication

### 3. User Roles

- **SuperAdmin**: Complete system access, can manage all clients
- **ClientAdmin**: Manage campaigns and rules for their client
- **ClientStaff**: Read-only access for their client
- **ExternalUser**: Customer access

### 4. Campaign Types

#### A. Order-Based Discount Campaign
Apply discounts based on order value
- Minimum order value requirement
- Percentage or fixed discount
- Maximum discount cap
- Usage limits per user and globally
- Date range and cooldown periods

#### B. Reward-Based Discount Campaign
Redeem points for discounts
- Points required for redemption
- Fixed discount amount
- Usage tracking
- Cooldown between redemptions

### 5. Loyalty Rules

Configurable rules for earning points:
- **Points per Currency**: Earn X points per $1 spent
- **Points per Purchase**: Fixed points per transaction
- **Points to Currency Rate**: Conversion rate for redemptions
- **Points Expiry**: Automatic expiration after X days

### 6. Points System

- Transaction-safe point management
- Real-time balance tracking
- Complete transaction history
- Automatic calculation based on loyalty rules
- Prevents negative balances

### 7. Redemption System

- Validation before application
- Race condition prevention with database locking
- Multiple validation checks:
  - Campaign validity
  - Usage limits
  - User eligibility
  - Points balance
  - Cooldown periods

## Quick Start

### 1. Start the System

```bash
# Start PostgreSQL
docker-compose up -d

# Install dependencies
npm install

# Start the application
npm run start:dev

# Seed test data
npm run seed
```

### 2. Access Swagger Documentation

Open: http://localhost:3000/api/docs

### 3. Login and Get Token

Use Swagger UI or curl:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "admin@lms.com",
      "role": "SuperAdmin",
      "clientId": null
    }
  }
}
```

### 4. Use the Access Token

In Swagger:
1. Click "Authorize" button
2. Enter: `Bearer YOUR_ACCESS_TOKEN`
3. Click "Authorize"

In curl:
```bash
curl http://localhost:3000/campaigns \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Generate API Key (for third-party integrations)

```bash
curl -X POST http://localhost:3000/clients/{clientId}/generate-api-key \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "E-commerce Integration"}'
```

### 6. Use API Key for External Integrations

```bash
# Calculate points for an order
curl -X POST http://localhost:3000/points/calculate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "orderValue": 150.00,
    "orderId": "ORDER-12345"
  }'

# Validate a redemption
curl -X POST http://localhost:3000/redeem/validate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "userId": "user-uuid",
    "orderValue": 100.00
  }'

# Apply a redemption
curl -X POST http://localhost:3000/redeem/apply \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "userId": "user-uuid",
    "orderValue": 100.00,
    "orderId": "ORDER-12345"
  }'
```

## Common Use Cases

### Use Case 1: Create a "10% Off" Campaign

1. Login as ClientAdmin
2. POST /campaigns with:
```json
{
  "name": "10% Off Orders Above $100",
  "type": "discount_order_based",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "minOrderValue": 100,
  "discountType": "percentage",
  "discountValue": 10,
  "maxDiscountCap": 50,
  "usageLimitPerUser": 5
}
```

### Use Case 2: Create a Loyalty Rule

1. Login as ClientAdmin
2. POST /loyalty/rules with:
```json
{
  "name": "Points per Dollar",
  "type": "points_per_currency",
  "pointsPerCurrency": 1,
  "pointsToCurrencyRate": 0.01,
  "pointsExpiryDays": 365
}
```

### Use Case 3: Process an Order (E-commerce Integration)

1. Customer makes a purchase
2. E-commerce system calls:
```bash
POST /points/calculate
{
  "userId": "customer-uuid",
  "orderValue": 150.00,
  "orderId": "ORDER-12345"
}
```
3. System calculates and adds points automatically
4. Customer sees updated balance

### Use Case 4: Apply a Discount

1. Customer selects a campaign at checkout
2. E-commerce system validates:
```bash
POST /redeem/validate
{
  "campaignId": "campaign-uuid",
  "userId": "customer-uuid",
  "orderValue": 120.00
}
```
3. If valid, apply the redemption:
```bash
POST /redeem/apply
{
  "campaignId": "campaign-uuid",
  "userId": "customer-uuid",
  "orderValue": 120.00,
  "orderId": "ORDER-12346"
}
```
4. System deducts points (if needed) and returns discount amount

## Database Schema

### Core Tables
- **clients**: Tenant/merchant information
- **users**: System users and customers
- **api_keys**: API keys for integrations
- **campaigns**: Discount and loyalty campaigns
- **loyalty_rules**: Configurable loyalty rules
- **user_points**: Current points balance per user
- **point_transactions**: Complete points history
- **redemptions**: Redemption records
- **audit_logs**: System audit trail

## Security Features

1. **Password Security**: Bcrypt hashing
2. **JWT Tokens**: Secure token-based auth
3. **API Key Validation**: Server-to-server auth
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Prevent injection attacks
6. **CORS Protection**: Configured origins
7. **Role-Based Access**: Strict permission checks
8. **Tenant Isolation**: Data segregation

## Error Handling

All errors return standardized format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Performance & Concurrency

- **Database Transactions**: ACID compliance for points and redemptions
- **Pessimistic Locking**: Prevents race conditions during redemption
- **Efficient Queries**: Proper indexing on all foreign keys
- **Connection Pooling**: TypeORM connection management

## Test Credentials (after seeding)

- **Super Admin**: admin@lms.com / admin123
- **Client Admin**: clientadmin@testclient.com / client123
- **Customer**: customer@example.com / customer123

## Support & Documentation

- Swagger UI: http://localhost:3000/api/docs
- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io

## Production Checklist

Before deploying to production:

- [ ] Change all JWT secrets in .env
- [ ] Set NODE_ENV=production
- [ ] Disable synchronize in database config
- [ ] Set up database migrations
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review and adjust rate limits
- [ ] Set up CI/CD pipeline
- [ ] Load test the API
- [ ] Security audit

## Troubleshooting

### Application won't start
- Check PostgreSQL is running: `docker-compose ps`
- Check .env file exists and has correct values
- Check port 3000 is not in use

### Cannot connect to database
- Verify PostgreSQL connection in .env
- Check Docker container is healthy: `docker-compose ps`
- Try recreating the database: `docker-compose down -v && docker-compose up -d`

### Seed script fails
- Ensure application has run at least once (to create tables)
- Check database connection
- Verify no duplicate data exists

## API Rate Limits

Default configuration:
- 10 requests per 60 seconds per IP
- Configurable via THROTTLE_TTL and THROTTLE_LIMIT in .env

## Monitoring Endpoints

- GET / - Health check (returns "Hello World!")
- Swagger docs are always available even in production

## Future Enhancements

Potential features for future versions:
- Referral programs
- Tier-based loyalty (Bronze, Silver, Gold)
- Gamification features
- Email notifications
- Analytics dashboard
- Batch operations API
- Webhook support
- GraphQL API
