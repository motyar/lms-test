#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Exit on error
set -e

echo "========================================="
echo "LMS Setup Script"
echo "========================================="
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to wait for postgres
wait_for_postgres() {
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for PostgreSQL to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
            print_success "PostgreSQL is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "PostgreSQL did not start in time"
    return 1
}

# Trap errors
trap 'print_error "Setup failed at line $LINENO. Check the error message above."; exit 1' ERR

# Step 1: Run dependency checks
print_status "Step 1/8: Checking dependencies..."
if [ -f "./check-deps.sh" ]; then
    chmod +x ./check-deps.sh
    if ! ./check-deps.sh; then
        print_error "Dependency check failed. Please install missing dependencies."
        exit 1
    fi
else
    print_warning "check-deps.sh not found, skipping dependency check"
fi
echo ""

# Step 2: Create .env file if it doesn't exist
print_status "Step 2/8: Setting up environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please review .env file and update settings as needed (especially JWT secrets for production)"
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_success ".env file already exists"
fi
echo ""

# Step 3: Install Node.js dependencies
print_status "Step 3/8: Installing Node.js dependencies..."
if command_exists npm; then
    npm install
    print_success "Dependencies installed successfully"
else
    print_error "npm not found. Please install Node.js and npm first."
    exit 1
fi
echo ""

# Step 4: Stop any existing Docker containers
print_status "Step 4/8: Cleaning up existing Docker containers..."
if command_exists docker; then
    if docker compose ps | grep -q "lms-postgres"; then
        print_status "Stopping existing containers..."
        docker compose down
        print_success "Existing containers stopped"
    else
        print_success "No existing containers to clean up"
    fi
else
    print_error "Docker not found. Please install Docker first."
    exit 1
fi
echo ""

# Step 5: Start PostgreSQL using Docker Compose
print_status "Step 5/8: Starting PostgreSQL database..."
docker compose up -d
print_success "PostgreSQL container started"
echo ""

# Step 6: Wait for PostgreSQL to be ready
print_status "Step 6/8: Waiting for database to be ready..."
if wait_for_postgres; then
    # Additional wait to ensure database is fully initialized
    sleep 3
else
    print_error "Failed to connect to PostgreSQL"
    print_status "Checking container logs..."
    docker compose logs postgres
    exit 1
fi
echo ""

# Step 7: Build the application
print_status "Step 7/8: Building the application..."
npm run build
print_success "Application built successfully"
echo ""

# Step 8: Run database migrations and seed data
print_status "Step 8/8: Setting up database and seeding data..."
print_status "Starting application in development mode (this will create tables)..."
print_warning "The application will start and create database tables automatically."
print_warning "Once you see 'Nest application successfully started', you can:"
print_warning "  1. Press Ctrl+C to stop the server"
print_warning "  2. Then run: npm run seed"
print_warning "  3. Finally run: npm run start:dev"
echo ""

# Start the application temporarily to create tables
print_status "Starting application to initialize database schema..."
timeout 30s npm run start:dev || true

echo ""
print_success "Application started briefly to create database schema"
print_status "Now you can run the seed script..."
echo ""

# Try to run seed
print_status "Running database seed..."
if npm run seed; then
    print_success "Database seeded successfully"
else
    print_warning "Seeding failed or was skipped. You can run it manually later with: npm run seed"
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
print_success "LMS has been set up successfully!"
echo ""
echo "Next steps:"
echo "  1. Start the development server:"
echo "     ${GREEN}npm run start:dev${NC}"
echo ""
echo "  2. Access the API documentation:"
echo "     ${GREEN}http://localhost:3000/api/docs${NC}"
echo ""
echo "  3. Default test credentials (after seeding):"
echo "     - Super Admin: admin@lms.com / admin123"
echo "     - Client Admin: clientadmin@testclient.com / client123"
echo "     - Customer: customer@example.com / customer123"
echo ""
echo "Useful commands:"
echo "  - Start dev server: npm run start:dev"
echo "  - Build for production: npm run build"
echo "  - Run tests: npm run test"
echo "  - Reseed database: npm run seed"
echo "  - Stop PostgreSQL: docker compose down"
echo "  - View logs: docker compose logs -f"
echo ""
print_warning "Note: Make sure to change JWT secrets in .env before deploying to production!"
echo ""
