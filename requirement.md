Below is the **corrected and backend-only implementation prompt**, using **NestJS** and including **Swagger test UI integration**.

---

# FULL BACKEND IMPLEMENTATION PROMPT

## Project: Loyalty Management System (LMS)

Build a production-ready, scalable, API-first **Loyalty Management System Backend** using **NestJS (TypeScript)** with integrated **Swagger UI for API testing and documentation**.

This system must integrate with third-party e-commerce platforms via middleware and support configurable discount campaigns, loyalty campaigns, and advanced redemption logic.

This is a backend-only project. No frontend UI is required except Swagger.

---

# 1. Core Objectives

Build a secure, multi-tenant backend that:

* Exposes REST APIs for third-party integrations
* Supports Discount Campaigns and Loyalty Campaigns
* Allows configurable reward logic per client
* Enforces strict backend redemption validation
* Ensures tenant-level data isolation
* Provides Swagger UI documentation for all APIs

---

# 2. Technology Stack

## Framework

* NestJS (latest stable version)
* TypeScript (strict mode enabled)

## Database

* PostgreSQL
* TypeORM or Prisma (choose one and structure cleanly)
* Proper indexing and constraints

## Authentication

* JWT-based authentication
* Role-based access control
* API key authentication for third-party integrations

## Documentation

* Swagger (NestJS Swagger module)
* Fully documented endpoints with:

  * Request DTOs
  * Response DTOs
  * Example payloads
  * Authentication metadata

Swagger must be available at:

```
/api/docs
```

---

# 3. Architecture Requirements

Follow clean modular architecture:

* Modules
* Controllers
* Services
* Repositories (if TypeORM)
* DTOs
* Guards
* Interceptors
* Middleware
* Filters

Required global configurations:

* Global validation pipe
* Global exception filter
* Centralized error handling
* Logging middleware
* Rate limiting (ThrottlerModule)

---

# 4. Multi-Tenant Architecture

System must support multiple clients (merchants).

Tenant resolution via:

* API key header OR
* JWT claim

Requirements:

* Data isolation enforced via `client_id`
* All queries scoped by tenant
* Prevent cross-tenant access

---

# 5. Authentication & Authorization

Roles:

* SuperAdmin
* ClientAdmin
* ClientStaff
* ExternalUser (API consumer)

Features:

* JWT login
* Refresh tokens
* Password hashing (bcrypt)
* Role-based guards
* API key generation for clients
* API key validation guard

---

# 6. Core Business Modules

---

# 6.1 Campaign Module

Two types:

## A. Discount Campaign

### 1. Order-Based Discount

Configurable:

* Minimum order value
* Discount type (percentage | fixed)
* Maximum discount cap
* Start date
* End date
* Status (active/inactive)
* Usage limit per user
* Global usage limit

### 2. Reward-Based Discount

Configurable:

* Points required
* Discount value
* Expiry
* Max usage per user

---

## B. Loyalty Campaign Module

Configurable rule types:

1. Points per currency spent
2. Points per purchase count
3. Custom logic flag
4. Points-to-currency conversion rate

All rules:

* Client configurable
* Editable
* Stored in database
* Validated before saving

---

# 6.2 Points Module

Responsibilities:

* Calculate points
* Store user points
* Maintain transaction history
* Prevent negative balances

APIs:

* Calculate points for order
* Fetch user balance
* Fetch transaction history

All calculations must:

* Be transaction-safe
* Use DB transactions

---

# 6.3 Redemption Module

Applies to all campaign types.

Configurable redemption rules:

* Valid date window
* Max redemptions per user
* Global redemption cap
* Minimum cart value
* Stackable or non-stackable
* Points expiry
* Cooldown duration

Must:

* Use DB transactions
* Prevent race conditions
* Lock rows when redeeming
* Validate before applying

---

# 7. Required API Endpoints

## Auth

* POST /auth/login
* POST /auth/refresh
* POST /auth/logout

## Clients (SuperAdmin)

* POST /clients
* GET /clients
* PUT /clients/:id
* POST /clients/:id/generate-api-key

## Campaigns

* POST /campaigns
* GET /campaigns
* GET /campaigns/:id
* PUT /campaigns/:id
* DELETE /campaigns/:id

## Loyalty Rules

* POST /loyalty/rules
* GET /loyalty/rules
* PUT /loyalty/rules/:id

## Points

* POST /points/calculate
* GET /users/:id/points
* GET /users/:id/points/history

## Redemption

* POST /redeem/validate
* POST /redeem/apply
* GET /redemptions/history

All endpoints must:

* Use DTO validation (class-validator)
* Be Swagger documented
* Enforce tenant scope
* Return standardized responses

---

# 8. Standard API Response Format

Success:

```
{
  "success": true,
  "data": {...}
}
```

Failure:

```
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

# 9. Database Schema (Minimum Tables)

* clients
* users
* roles
* api_keys
* campaigns
* loyalty_rules
* campaign_rules
* user_points
* point_transactions
* redemptions
* audit_logs

Must include:

* Foreign keys
* Indexes on:

  * client_id
  * user_id
  * campaign_id
* Unique constraints
* Soft delete support (optional)

---

# 10. Security Requirements

* HTTPS ready
* CORS configured
* JWT guard
* Role guard
* API key guard
* Rate limiting
* Input validation
* Global exception filter
* SQL injection protection
* Secure environment variables

---

# 11. Performance & Concurrency

* Use transactions for:

  * Redemption
  * Points update
* Avoid N+1 queries
* Proper indexing
* Efficient filtering queries
* High concurrency safe redemption logic

---

# 12. Validation Rules

* Campaign date must be valid
* Campaign cannot be applied if inactive
* Redemption must respect usage limits
* Points cannot go below zero
* Expired campaigns rejected
* Tenant mismatch rejected

---

# 13. Swagger Requirements

* Auto-generated docs
* Group endpoints by module
* Include:

  * Bearer auth config
  * API key header documentation
  * Request/response examples
* Swagger UI served at:

```
/api/docs
```

---

# 14. Project Structure

Follow modular NestJS structure:

```
src/
  auth/
  clients/
  campaigns/
  loyalty/
  points/
  redemption/
  common/
  database/
  guards/
  filters/
  interceptors/
```

---

# 15. Deliverables Required

1. Fully working NestJS backend
2. PostgreSQL schema & migrations
3. Swagger UI working at /api/docs
4. Seed data
5. .env example file
6. README with:

   * Setup instructions
   * Environment configuration
   * Swagger access guide

---

# Final Instruction to IDE

Generate a complete production-ready NestJS backend following the above specification.

Do not skip:

* Tenant isolation
* Swagger integration
* Validation
* Security guards
* Transaction-safe redemption logic
* Proper modular structure
