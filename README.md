# Loyalty Management System (LMS) API

A production-ready, scalable, API-first **Loyalty Management System Backend** built with **NestJS (TypeScript)** and **PostgreSQL**.

## Features

- 🔐 **JWT-based Authentication** with role-based access control
- 🏢 **Multi-tenant Architecture** with data isolation
- 🎯 **Campaign Management** (Discount & Loyalty campaigns)
- ⭐ **Points Management** with transaction history
- 💰 **Redemption System** with validation and race condition prevention
- 📚 **Swagger Documentation** at `/api/docs`
- 🔒 **API Key Authentication** for third-party integrations
- ⚡ **Rate Limiting** with ThrottlerModule
- 🛡️ **Security**: CORS, input validation, SQL injection protection

## Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Environment Configuration

Create a `.env` file in the root directory (use `.env.example` as template):

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=lms_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Installation

### Option 1: Using Docker Compose (Recommended)

```bash
# Install dependencies
npm install

# Start PostgreSQL using Docker Compose
docker-compose up -d

# Wait for PostgreSQL to be ready (about 10 seconds)
sleep 10

# Run the application (will auto-create tables in development mode)
npm run start:dev

# In a new terminal, seed the database with test data
npm run seed
```

### Option 2: Using Local PostgreSQL

```bash
# Install dependencies
npm install

# Set up PostgreSQL database
createdb lms_db

# Run the application (will auto-create tables in development mode)
npm run start:dev

# Seed the database with test data
npm run seed
```

## Database Seeding

The seed script creates:
- Test client: "Test Client Corp"
- Super Admin: `admin@lms.com` / `admin123`
- Client Admin: `clientadmin@testclient.com` / `client123`
- Customer: `customer@example.com` / `customer123`
- Sample loyalty rules and campaigns
- API key for testing

Run the seed:
```bash
npm run seed
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000`

## API Documentation

Swagger UI is available at: **http://localhost:3000/api/docs**

The Swagger interface provides:
- Complete API documentation
- Request/response examples
- Interactive API testing
- Authentication configuration (Bearer token & API key)

## API Endpoints Overview

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Clients (SuperAdmin only)
- `POST /clients` - Create new client
- `GET /clients` - Get all clients
- `GET /clients/:id` - Get client by ID
- `PUT /clients/:id` - Update client
- `POST /clients/:id/generate-api-key` - Generate API key

### Campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns` - Get all campaigns
- `GET /campaigns/:id` - Get campaign by ID
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

### Loyalty Rules
- `POST /loyalty/rules` - Create loyalty rule
- `GET /loyalty/rules` - Get all rules
- `GET /loyalty/rules/:id` - Get rule by ID
- `PUT /loyalty/rules/:id` - Update rule

### Points
- `POST /points/calculate` - Calculate and add points (API key required)
- `GET /points/users/:id/points` - Get user points balance
- `GET /points/users/:id/points/history` - Get transaction history

### Redemption
- `POST /redeem/validate` - Validate redemption (API key required)
- `POST /redeem/apply` - Apply redemption (API key required)
- `GET /redeem/history/:userId` - Get redemption history

## Authentication Methods

### 1. JWT Bearer Token (for internal users)
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}'

# Use the returned token
curl http://localhost:3000/campaigns \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. API Key (for third-party integrations)
```bash
curl http://localhost:3000/redeem/validate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"...","userId":"...","orderValue":100}'
```

## User Roles

- **SuperAdmin**: Full system access
- **ClientAdmin**: Manage campaigns and rules for their client
- **ClientStaff**: View-only access for their client
- **ExternalUser**: Basic customer access

## Multi-Tenant Data Isolation

All data is scoped by `client_id`:
- Queries are automatically filtered by tenant
- Cross-tenant access is prevented
- API keys are linked to specific clients

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- API key validation
- Role-based access control (RBAC)
- Request rate limiting
- Input validation and sanitization
- SQL injection protection via TypeORM
- CORS configuration
- Global exception handling

## Project Structure

```
src/
├── auth/                 # Authentication module
├── campaigns/            # Campaign management
├── clients/             # Client management
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── dto/             # Common DTOs
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards
│   ├── interceptors/    # Response interceptors
│   └── middleware/      # Custom middleware
├── database/            # Database configuration
│   ├── entities/        # TypeORM entities
│   └── seeds/           # Database seeds
├── loyalty/             # Loyalty rules module
├── points/              # Points management
├── redemption/          # Redemption module
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Database Schema

Key tables:
- `clients` - Tenant/client information
- `users` - System and customer users
- `api_keys` - API keys for integrations
- `campaigns` - Discount and loyalty campaigns
- `loyalty_rules` - Configurable loyalty rules
- `user_points` - User points balances
- `point_transactions` - Points history
- `redemptions` - Redemption records
- `audit_logs` - Audit trail

## Testing with Swagger

1. Start the application: `npm run start:dev`
2. Open Swagger UI: http://localhost:3000/api/docs
3. Login to get a JWT token:
   - Click "POST /auth/login"
   - Use: `admin@lms.com` / `admin123`
   - Copy the `accessToken` from response
4. Authorize:
   - Click "Authorize" button at top
   - Enter: `Bearer YOUR_ACCESS_TOKEN`
5. Test endpoints interactively

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Create database if missing
createdb lms_db

# Check connection settings in .env
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secrets
3. Set `synchronize: false` in database config
4. Use database migrations instead of auto-sync
5. Configure proper CORS origins
6. Enable HTTPS
7. Use environment-specific configuration
8. Set up proper logging and monitoring

## Support

For issues or questions, please refer to:
- Swagger Documentation: http://localhost:3000/api/docs
- NestJS Documentation: https://docs.nestjs.com

## License

This project is MIT licensed.

$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
