# Local Development Setup Guide

## Prerequisites

- Docker and Docker Compose installed on your system
- Node.js 18+ (for local development if needed)
- Git

## Environment Variables Setup

Create or update the `.env` file in the project root with the following variables:

```env
# --- General Settings ---
NODE_ENV=development

# --- Database ---
POSTGRES_HOST_LOCAL=postgres
POSTGRES_PORT_LOCAL=5432
POSTGRES_USER=crodo
POSTGRES_PASSWORD=mypassword123
POSTGRES_DB=realwordio
POSTGRES_PORT=5433   # Host port to avoid conflict with local PostgreSQL

# --- NestJS Application ---
APP_PORT=3000
```

## Step-by-Step Execution Commands

### 1. Start Development Environment

```bash
# Using the main docker-compose.yml with dev profile
docker compose --profile dev up

# Or using the specific command for development
docker compose -f docker-compose.yml --profile dev up
```

### 2. Build and Start Services

```bash
# Build and start all services in detached mode
docker compose --profile dev up -d

# Build specific services
docker compose --profile dev build
```

### 3. View Logs

```bash
# View logs for all services
docker compose --profile dev logs

# Follow logs for specific service
docker compose --profile dev logs -f backend_dev
```

### 4. Stop Services

```bash
# Stop all services
docker compose --profile dev down

# Stop services and remove volumes
docker compose --profile dev down -v
```

## Service Configuration

### Backend Development Service (`backend_dev`)

- **Container Name**: `backend_nest_dev`
- **Build**: Uses `Dockerfile.dev`
- **Port Mapping**: `${APP_PORT}:${APP_PORT}` (default: 3000:3000)
- **Volumes**:
    - Local code mounted to `/usr/src/app`
    - Local `node_modules` mounted to avoid conflicts
- **Environment**: Development mode with hot-reload via nodemon
- **Health Check**: Waits for PostgreSQL to be healthy

### PostgreSQL Service

- **Image**: `postgres:15-alpine`
- **Container Name**: `myapp_postgres`
- **Port Mapping**: `${POSTGRES_PORT}:5432` (default: 5433:5432)
- **Volume**: Persistent data storage in `pgdata` volume
- **Health Check**: Uses `pg_isready` to verify database readiness

## Health Check Verification

### Database Health Check

```bash
# Check if PostgreSQL is ready
docker exec myapp_postgres pg_isready -U crodo -d realwordio

# Expected output: "localhost:5432 - accepting connections"
```

### Application Health Check

```bash
# Check if NestJS application is running
curl http://localhost:3000

# Check application logs
docker logs backend_nest_dev
```

### Service Status

```bash
# Check running services
docker compose --profile dev ps

# Check service health status
docker inspect --format='{{.State.Health.Status}}' myapp_postgres
```

## Development Workflow

### Hot Reload Development

- The development setup uses nodemon for automatic restart on file changes
- Source code changes are immediately reflected in the running container
- TypeScript files are compiled on-the-fly using ts-node

### Database Operations

```bash
# Run database migrations
docker exec backend_nest_dev npm run migration:run

# Generate new migration
docker exec backend_nest_dev npm run migration:generate

# Revert last migration
docker exec backend_nest_dev npm run migration:revert
```

### Testing

```bash
# Run tests inside container
docker exec backend_nest_dev npm test

# Run tests with coverage
docker exec backend_nest_dev npm run test:cov

# Run e2e tests
docker exec backend_nest_dev npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
    - Change `POSTGRES_PORT` in `.env` if 5433 is occupied
    - Change `APP_PORT` if 3000 is occupied

2. **Permission Issues**:
    - Ensure Docker has proper permissions to mount volumes

3. **Build Issues**:
    - Clear Docker cache: `docker builder prune`
    - Rebuild images: `docker compose --profile dev build --no-cache`

4. **Database Connection Issues**:
    - Verify PostgreSQL is running: `docker compose --profile dev ps`
    - Check database logs: `docker compose --profile dev logs postgres`

### Logs and Debugging

```bash
# Detailed service inspection
docker inspect backend_nest_dev

# View environment variables
docker exec backend_nest_dev env

# Access container shell
docker exec -it backend_nest_dev sh
```

## Cleanup

```bash
# Stop and remove all containers, networks, and volumes
docker compose --profile dev down -v

# Remove unused Docker resources
docker system prune
```

This development setup provides a complete local environment with hot-reload capabilities, making it ideal for development and testing.
