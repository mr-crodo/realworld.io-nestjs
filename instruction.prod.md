# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on production server
- Domain name and SSL certificate (recommended for production)
- Reverse proxy setup (nginx, traefik, or similar)
- Backup strategy for database
- Monitoring and logging infrastructure

## Environment Variables Setup

Create a production `.env.prod` file with secure values:

```env
# --- General Settings ---
NODE_ENV=production

# --- Database ---
POSTGRES_USER=your_production_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=realwordio_prod
POSTGRES_PORT=5432

# --- Application ---
APP_PORT=3000

# --- Security (Optional) ---
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
```

**Security Note**: Use strong, randomly generated passwords and secrets in production. Consider using a secrets management system.

## Step-by-Step Deployment Commands

### 1. Build Production Images

```bash
# Build production images
docker compose --profile prod build

# Build with no cache for clean build
docker compose --profile prod build --no-cache
```

### 2. Start Production Services

```bash
# Start all production services in detached mode
docker compose --profile prod up -d

# Start with specific environment file
docker compose --env-file .env.prod --profile prod up -d
```

### 3. Verify Deployment

```bash
# Check service status
docker compose --profile prod ps

# View logs
docker compose --profile prod logs

# Check application health
curl http://localhost:3000
```

### 4. Stop Production Services

```bash
# Stop services gracefully
docker compose --profile prod down

# Stop and remove volumes (use with caution)
docker compose --profile prod down -v
```

## Service Configuration

### Backend Production Service (`backend_prod`)
- **Container Name**: `backend_nest_prod`
- **Build**: Uses `Dockerfile.prod` (multi-stage build)
- **Port Mapping**: `${APP_PORT}:${APP_PORT}`
- **Environment**: Production mode with optimized dependencies
- **Security**: Runs as non-root user (UID 1001)
- **Restart Policy**: Always restart on failure

### PostgreSQL Service
- **Image**: `postgres:15-alpine`
- **Container Name**: `myapp_postgres`
- **Volume**: Persistent `pgdata` volume for data storage
- **Health Check**: Automatic readiness verification
- **Port**: Exposed on host port specified in environment

## Production Optimization

### 1. Resource Limits

Add resource constraints to `docker-compose.yml`:

```yaml
services:
  backend_prod:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1'
    
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'
```

### 2. Database Backups

```bash
# Create backup script
#!/bin/bash
docker exec myapp_postgres pg_dump -U your_production_user realwordio_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
cat backup_file.sql | docker exec -i myapp_postgres psql -U your_production_user realwordio_prod
```

### 3. Log Management

```bash
# Configure log rotation in docker-compose.yml
services:
  backend_prod:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Health Check Verification

### Application Health
```bash
# HTTP health check
curl -f http://localhost:3000 || echo "Application unhealthy"

# Container health check
docker inspect --format='{{.State.Health.Status}}' backend_nest_prod
```

### Database Health
```bash
# Database connectivity check
docker exec myapp_postgres pg_isready -U your_production_user -d realwordio_prod

# Database size and status
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "SELECT pg_database_size('realwordio_prod');"
```

### System Monitoring
```bash
# Resource usage
docker stats

# Container performance
docker top backend_nest_prod

# Log monitoring
docker compose --profile prod logs --tail=100 -f
```

## Security Best Practices

### 1. Network Security
```yaml
# In docker-compose.yml
networks:
  backend_net:
    driver: bridge
    internal: true  # Make network internal if using reverse proxy
```

### 2. Environment Security
- Never commit `.env.prod` to version control
- Use Docker secrets for sensitive data
- Regularly rotate database passwords and JWT secrets

### 3. Container Security
```bash
# Regular security updates
docker compose --profile prod pull

# Scan images for vulnerabilities
docker scan your-image-name
```

## Deployment Strategies

### Blue-Green Deployment

1. **Setup**:
   ```bash
   # Deploy new version with different compose project name
   docker compose -p realworld-prod-v2 --profile prod up -d
   ```

2. **Switch**: Update reverse proxy to point to new version

3. **Cleanup**: Remove old version
   ```bash
   docker compose -p realworld-prod-v1 down
   ```

### Rolling Updates

```bash
# Update application with zero downtime
docker compose --profile prod up -d --force-recreate

# Update specific service
docker compose --profile prod up -d --force-recreate backend_prod
```

## Maintenance Operations

### Database Maintenance
```bash
# Run database vacuum
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "VACUUM ANALYZE;"

# Check database statistics
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "\dt+"
```

### Application Maintenance
```bash
# View running processes
docker exec backend_nest_prod ps aux

# Check memory usage
docker exec backend_nest_prod free -m

# Application metrics
docker exec backend_nest_prod npm run start:prod -- --metrics
```

### Backup and Recovery

```bash
# Full backup procedure
#!/bin/bash
# Backup database
docker exec myapp_postgres pg_dump -U your_production_user realwordio_prod > /backups/db_backup_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v pgdata:/volume -v /backups:/backup alpine tar czf /backup/pgdata_$(date +%Y%m%d).tar.gz -C /volume ./

# Rotate old backups (keep 30 days)
find /backups -name "*.sql" -mtime +30 -delete
find /backups -name "*.tar.gz" -mtime +30 -delete
```

## Troubleshooting Production Issues

### Common Production Issues

1. **Memory Issues**:
   ```bash
   # Check memory usage
docker stats

   # Increase memory limits if needed
   ```

2. **Database Performance**:
   ```bash
   # Monitor database queries
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "SELECT * FROM pg_stat_activity;"
   ```

3. **Application Errors**:
   ```bash
   # Check application logs
docker compose --profile prod logs backend_prod

   # Restart application
docker compose --profile prod restart backend_prod
   ```

### Emergency Procedures

```bash
# Emergency restart
docker compose --profile prod restart

# Rollback to previous version
docker compose --profile prod up -d --force-recreate

# Complete rebuild
docker compose --profile prod down
docker compose --profile prod build --no-cache
docker compose --profile prod up -d
```

## Monitoring and Alerting

### Recommended Monitoring Setup

1. **Prometheus + Grafana** for metrics
2. **ELK Stack** for logging
3. **Health check endpoints** for application monitoring
4. **Database monitoring** with pg_stat statements

### Health Endpoints

Ensure your application has:
- `/health` endpoint for basic health checks
- `/metrics` endpoint for Prometheus metrics
- `/ready` endpoint for readiness checks

This production setup provides a robust, scalable deployment with proper security practices and maintenance procedures.