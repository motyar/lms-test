#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

echo "========================================="
echo "LMS Dependency Checker"
echo "========================================="
echo ""

# Function to check command existence
check_command() {
    local cmd=$1
    local name=$2
    local install_instruction=$3
    
    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT installed"
        echo -e "  ${YELLOW}Install:${NC} $install_instruction"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check version
check_version() {
    local current=$1
    local required=$2
    local name=$3
    
    if [ "$(printf '%s\n' "$required" "$current" | sort -V | head -n1)" = "$required" ]; then
        echo -e "${GREEN}✓${NC} $name version $current (required: >= $required)"
        return 0
    else
        echo -e "${RED}✗${NC} $name version $current (required: >= $required)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check port availability
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || nc -z localhost $port 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC} Port $port is already in use (needed for $service)"
        WARNINGS=$((WARNINGS + 1))
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $port is available for $service"
        return 0
    fi
}

echo "Checking System Dependencies..."
echo "-----------------------------------"

# Check Node.js
if check_command "node" "Node.js" "Visit https://nodejs.org/ or use a package manager (e.g., apt, brew, nvm)"; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    check_version "$NODE_VERSION" "18.0.0" "Node.js"
fi

# Check npm
if check_command "npm" "npm" "npm is usually installed with Node.js"; then
    NPM_VERSION=$(npm --version)
    check_version "$NPM_VERSION" "9.0.0" "npm"
fi

# Check Docker
if check_command "docker" "Docker" "Visit https://docs.docker.com/get-docker/"; then
    if ! docker ps &> /dev/null; then
        echo -e "${RED}✗${NC} Docker daemon is not running"
        echo -e "  ${YELLOW}Start Docker:${NC} sudo systemctl start docker (Linux) or start Docker Desktop"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓${NC} Docker daemon is running"
    fi
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed (v2)"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed (v1)"
    COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}✗${NC} Docker Compose is NOT installed"
    echo -e "  ${YELLOW}Install:${NC} Visit https://docs.docker.com/compose/install/"
    ERRORS=$((ERRORS + 1))
fi

# Optional: Check PostgreSQL client tools (helpful but not required)
if check_command "psql" "PostgreSQL client" "apt install postgresql-client (Ubuntu) or brew install postgresql (macOS) - OPTIONAL"; then
    PSQL_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    if [ ! -z "$PSQL_VERSION" ]; then
        check_version "$PSQL_VERSION" "14.0" "PostgreSQL client"
    fi
else
    echo -e "  ${YELLOW}Note:${NC} PostgreSQL client tools are optional (we use Docker for the database)"
fi

echo ""
echo "Checking Port Availability..."
echo "-----------------------------------"

check_port 3000 "Application"
check_port 5432 "PostgreSQL"

echo ""
echo "Checking Project Files..."
echo "-----------------------------------"

# Check if we're in the right directory
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
else
    echo -e "${RED}✗${NC} package.json not found - are you in the project root?"
    ERRORS=$((ERRORS + 1))
fi

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo -e "  ${YELLOW}Note:${NC} Will be created from .env.example during setup"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found"
    echo -e "  ${YELLOW}Note:${NC} Run 'npm install' to install dependencies"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You can now run: ./setup.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo ""
    echo "You can proceed with setup, but address warnings if needed."
    echo "Run: ./setup.sh"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found, $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please install missing dependencies before proceeding."
    exit 1
fi
