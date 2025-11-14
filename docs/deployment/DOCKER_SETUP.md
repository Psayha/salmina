# 🐳 Docker Setup Guide

## Prerequisites

1. **Install Docker Desktop**
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Verify Installation**
   ```bash
   docker --version
   docker compose version
   ```

## Starting the Project

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis in detached mode
docker compose up -d

# Check if containers are running
docker compose ps

# View logs
docker compose logs -f
```

### 2. Setup Database

```bash
# Navigate to backend directory
cd apps/backend

# Generate Prisma Client
pnpm db:generate

# Create and apply migrations
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

### 3. Verify Database Connection

```bash
# Open Prisma Studio to view database
pnpm db:studio
```

This will open http://localhost:5555 where you can see all database tables and data.

## Useful Docker Commands

### Managing Containers

```bash
# Stop all containers
docker compose stop

# Start stopped containers
docker compose start

# Restart containers
docker compose restart

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (⚠️ deletes all data)
docker compose down -v
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# View logs for specific service
docker compose logs postgres
docker compose logs redis

# Follow logs (stream)
docker compose logs -f
```

### Accessing Containers

```bash
# Access PostgreSQL container
docker compose exec postgres psql -U postgres -d telegram_shop

# Access Redis container
docker compose exec redis redis-cli
```

### Database Management

```bash
# Backup database
docker compose exec postgres pg_dump -U postgres telegram_shop > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres -d telegram_shop < backup.sql

# Reset database (⚠️ deletes all data)
docker compose down -v
docker compose up -d
cd apps/backend
pnpm db:migrate
pnpm db:seed
```

## Troubleshooting

### Port Already in Use

If port 5432 or 6379 is already in use:

1. **Option 1: Stop conflicting services**
   ```bash
   # macOS/Linux - Stop PostgreSQL
   sudo service postgresql stop

   # macOS/Linux - Stop Redis
   sudo service redis stop
   ```

2. **Option 2: Change ports in docker-compose.yml**
   ```yaml
   services:
     postgres:
       ports:
         - "5433:5432"  # Use port 5433 instead

     redis:
       ports:
         - "6380:6379"  # Use port 6380 instead
   ```

   Don't forget to update DATABASE_URL and REDIS_URL in .env!

### Cannot Connect to Database

1. **Check if containers are running**
   ```bash
   docker compose ps
   ```

2. **Check container health**
   ```bash
   docker compose logs postgres
   ```

3. **Verify DATABASE_URL in .env**
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/telegram_shop"
   ```

4. **Restart containers**
   ```bash
   docker compose restart
   ```

### Permission Denied

On Linux, you might need to add your user to the docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Clean Start

If everything fails, try a clean start:

```bash
# Remove all containers, networks, and volumes
docker compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes

# Start fresh
docker compose up -d
cd apps/backend
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Production Considerations

### Environment Variables

In production, use secure passwords and secrets:

```bash
# Generate strong passwords
openssl rand -base64 32

# Update docker-compose.yml or use .env
POSTGRES_PASSWORD=<strong-password>
```

### Volumes

Database data is stored in Docker volumes:
- `postgres_data` - PostgreSQL data
- `redis_data` - Redis data

To backup volumes:

```bash
docker run --rm -v telegram-shop_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

### Resource Limits

Add resource limits in docker-compose.yml:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Next Steps

After Docker is running:

1. Start the backend: `pnpm dev:backend`
2. Start the frontend: `pnpm dev`
3. Open http://localhost:3000

For more information, see [README.md](README.md)
