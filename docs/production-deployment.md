# Production Deployment

Guide for deploying MakerFlow to production using Docker Compose on a VPS with Traefik + Cloudflare.

## Architecture

Production runs multiple containers orchestrated by `docker-compose.prod.yaml`:

| Service | Image | Purpose |
|---------|-------|---------|
| **front** (x3) | Multi-stage Node 20 Alpine | React SSR server (Express) |
| **back** (x3) | Multi-stage PHP 8.2 Apache | Symfony API |
| **worker** (x2) | Same image as back | Symfony Messenger consumer (async tasks) |
| **db** | MySQL 8.0 | Database |
| **redis-store** | Redis 8.4.0 | Cache + rate limiting |
| **rabbitmq** | RabbitMQ 4.2.2 | Message broker |

Traefik (external) handles SSL termination and routes traffic to `front` and `back` via Docker labels.

## File Overview

| File | Purpose |
|------|---------|
| `docker-compose.prod.yaml` | Production compose orchestration |
| `back/.docker/build/Dockerfile.prod` | Multi-stage backend build (composer deps → runtime) |
| `back/.docker/build/docker-entrypoint.prod.sh` | Cache warmup on startup |
| `back/.docker/apache2/000-default.prod.conf` | Hardened Apache VirtualHost |
| `back/.docker/php/opcache.ini` | PHP OPcache production config |
| `back/.dockerignore` | Excludes dev files from build context |
| `front/Dockerfile` | Multi-stage frontend build (shared dev/prod) |
| `.env.prod.example` | Environment variable template |

## Prerequisites

- VPS with Docker and Docker Compose installed
- Traefik running with a `traefik` Docker network
- Cloudflare DNS pointing your domains to the VPS
- Domain names configured (e.g., `maker-flow.com` + `api.maker-flow.com`)

## Deployment Steps

### 1. Configure Environment

```bash
cp .env.prod.example .env
# Edit .env and fill in all CHANGE_ME values with strong passwords/secrets
```

### 2. Create Traefik Network

```bash
docker network create traefik || true
```

### 3. Build and Start

```bash
docker compose -f docker-compose.prod.yaml build
docker compose -f docker-compose.prod.yaml up -d
```

### 3b. Run Migrations (before first deploy or after schema changes)

Migrations are run as a one-off command, not automatically on startup (to avoid race conditions with multiple replicas):

```bash
docker compose -f docker-compose.prod.yaml run --rm back php bin/console doctrine:migrations:migrate --no-interaction
```

### 4. Verify

```bash
# Check all services are healthy
docker compose -f docker-compose.prod.yaml ps

# Check logs
docker compose -f docker-compose.prod.yaml logs -f
```

## Key Differences from Dev

| Aspect | Dev | Prod |
|--------|-----|------|
| Source code | Mounted volumes | Baked into images |
| Composer | Runs at container start | Runs at build time (no-dev) |
| PHP OPcache | Validates timestamps | No timestamp validation |
| Apache | Basic config | Security headers, file restrictions |
| Redis | No password | Password required |
| Ports | All exposed to host | Only via Traefik network |
| phpMyAdmin | Included | Removed |
| RabbitMQ mgmt | Port 15672 exposed | Not exposed (SSH tunnel if needed) |
| Worker | Manual | Dedicated container(s) with auto-restart |
| Replicas | Single instance | front x3, back x3, worker x2 |
| Migrations | Manual | One-off command before deploy |

## Worker Details

The `worker` container runs `messenger:consume` with:
- `--time-limit=3600`: Restarts every hour (prevents memory leaks)
- `--memory-limit=256M`: Restarts if memory exceeded
- Docker `restart: unless-stopped` ensures it comes back up

## Redis Password

Production Redis uses `requirepass`. The password flows through:
- `.env` → `REDIS_STORE_PASSWORD`
- `docker-compose.prod.yaml` → Redis `--requirepass` flag + backend env var
- `RedisStoreService` → Predis config
- `cache.yaml` → Rate limiter cache pool DSN

Dev remains passwordless (empty `REDIS_STORE_PASSWORD`).

## Rebuilding After Code Changes

```bash
docker compose -f docker-compose.prod.yaml build front back
docker compose -f docker-compose.prod.yaml up -d front back worker
```

Note: `worker` uses the same image as `back`, so restarting it picks up the new build.

## Accessing RabbitMQ Management UI

Not exposed in production. Use SSH tunnel:
```bash
ssh -L 15672:localhost:15672 your-vps
# Then open http://localhost:15672
```
