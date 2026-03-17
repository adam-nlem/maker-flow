# Production Deployment

Guide for deploying MakerFlow to production using Docker Compose on a VPS with Traefik + Cloudflare. Deployments are automated via a self-hosted GitHub Actions runner.

## Architecture

Production runs multiple containers orchestrated by `docker-compose.prod.yaml`:

| Service | Image | Purpose |
|---------|-------|---------|
| **front** (x3) | Multi-stage Node 20 Alpine | React SPA (Nginx) |
| **back** (x3) | Multi-stage PHP 8.2 Apache | Symfony API |
| **worker** (x2) | Same image as back | Symfony Messenger consumer (async tasks) |
| **db** | MySQL 8.0 | Database |
| **redis-store** | Redis 8.4.0 | Cache + rate limiting |
| **rabbitmq** | RabbitMQ 4.2.2 | Message broker |

Traefik handles SSL termination and routes traffic to `front` and `back` via Docker labels.

## File Overview

| File | Purpose |
|------|---------|
| `docker-compose.prod.yaml` | Production compose orchestration |
| `.github/workflows/build-and-push.yml` | CI/CD pipeline (build, push, deploy) |
| `back/.docker/build/Dockerfile.prod` | Multi-stage backend build (composer deps → runtime) |
| `back/.docker/build/docker-entrypoint.prod.sh` | Cache warmup on startup |
| `back/.docker/apache2/000-default.prod.conf` | Hardened Apache VirtualHost |
| `back/.docker/php/opcache.ini` | PHP OPcache production config |
| `back/.dockerignore` | Excludes dev files from build context |
| `front/Dockerfile` | Multi-stage frontend build (shared dev/prod) |
| `.env.prod.example` | Environment variable template |

## CI/CD Pipeline

Deployments are fully automated via GitHub Actions:

```
Push to main → Build images → Push to GHCR → Deploy via self-hosted runner
```

### How it works

1. **Build** (`ubuntu-latest`): `build-front` and `build-back` jobs run in parallel. Each builds a Docker image and pushes it to GHCR with two tags: `:latest` and `:<commit-sha>`.
2. **Deploy** (`self-hosted` runner on VPS): Runs after both builds succeed. The runner executes directly on the production server — no SSH keys or third-party actions involved.

### Deploy sequence

1. Pull the SHA-tagged images from GHCR
2. Run database migrations using the new back image (if migrations fail, old containers remain untouched)
3. Record previous `DEPLOY_TAG` for rollback, update `.env` with new SHA
4. Gracefully stop workers (SIGTERM, 60s timeout for current message to finish)
5. Recreate `back` and `front` services (Traefik routes to healthy replicas)
6. Wait for backend `/health` endpoint (30s timeout)
7. Restart workers with new image
8. On any failure: automatic rollback to previous SHA

### Production safeguards

- **Concurrency lock**: Only one deploy runs at a time (`concurrency.group: production-deploy`)
- **SHA-pinned images**: `DEPLOY_TAG` is always a commit SHA — deterministic, auditable
- **Migrations first**: Schema changes apply before new code runs. Old containers stay up if migrations fail.
- **Graceful worker drain**: Workers finish their current message before stopping
- **Health check gate**: Backend must respond on `/health` within 30s or rollback triggers
- **Automatic rollback**: `if: failure()` step reverts `DEPLOY_TAG` and recreates all services
- **Image pruning**: Old images (>7 days) are cleaned up after successful deploys
- **Environment protection**: `environment: production` allows adding manual approval gates via GitHub settings

## Initial Setup

### Prerequisites

- VPS with Docker and Docker Compose installed
- Cloudflare DNS pointing your domains to the VPS
- Domain names configured (e.g., `maker-flow.com` + `api.maker-flow.com`)

### 1. Configure Environment

```bash
cd /var/www/maker-flow
cp .env.prod.example .env
# Edit .env and fill in all CHANGE_ME values with strong passwords/secrets
```

### 2. Install the GitHub Actions Runner

The self-hosted runner executes deploy jobs directly on the VPS. No SSH keys are shared with GitHub.

```bash
# Create a dedicated user with Docker access
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner

# Switch to the runner user
sudo su - github-runner

# Download the runner (check https://github.com/actions/runner/releases for latest version)
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf actions-runner-linux-x64.tar.gz

# Configure — get the registration token from:
# GitHub repo → Settings → Actions → Runners → New self-hosted runner
./config.sh --url https://github.com/adam-nlem/maker-flow --token <REGISTRATION_TOKEN>

# Install as systemd service (auto-starts on reboot)
sudo ./svc.sh install github-runner
sudo ./svc.sh start
```

Verify: the runner should appear as "Idle" in GitHub repo Settings → Actions → Runners.

### 3. Start Services (first time)

```bash
docker compose -f docker-compose.prod.yaml up -d
```

### 4. Run Initial Migrations

```bash
docker compose -f docker-compose.prod.yaml run --rm back \
  php bin/console doctrine:migrations:migrate --no-interaction
```

### 5. Verify

```bash
# Check all services are healthy
docker compose -f docker-compose.prod.yaml ps

# Check logs
docker compose -f docker-compose.prod.yaml logs -f
```

## Manual Rollback

If you need to rollback outside of the CI/CD pipeline:

```bash
cd /var/www/maker-flow

# Find the previous SHA (check git log or GitHub Actions history)
PREV_SHA=<commit-sha>

# Pull the old images
docker pull ghcr.io/adam-nlem/maker-flow-back:${PREV_SHA}
docker pull ghcr.io/adam-nlem/maker-flow-front:${PREV_SHA}

# Update the tag and recreate
sed -i "s/^DEPLOY_TAG=.*/DEPLOY_TAG=${PREV_SHA}/" .env
docker compose -f docker-compose.prod.yaml up -d --force-recreate back front worker
```

Note: Database migrations are NOT automatically rolled back. Migrations must be backward-compatible (additive only: new columns with defaults, new tables, new indexes). Destructive schema changes should be split across two deploys.

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
| Deployment | Manual | Automated via CI/CD on push to main |
| Image tags | N/A | SHA-pinned via `DEPLOY_TAG` |

## Worker Details

The `worker` container runs `messenger:consume` with:
- `--time-limit=3600`: Restarts every hour (prevents memory leaks)
- `--memory-limit=256M`: Restarts if memory exceeded
- Docker `restart: unless-stopped` ensures it comes back up
- During deploys, workers receive SIGTERM and have 60s to finish the current message

## Redis Password

Production Redis uses `requirepass`. The password flows through:
- `.env` → `REDIS_STORE_PASSWORD`
- `docker-compose.prod.yaml` → Redis `--requirepass` flag + backend env var
- `RedisStoreService` → Predis config
- `cache.yaml` → Rate limiter cache pool DSN

Dev remains passwordless (empty `REDIS_STORE_PASSWORD`).

## Accessing RabbitMQ Management UI

Not exposed in production. Use SSH tunnel:
```bash
ssh -L 15672:localhost:15672 your-vps
# Then open http://localhost:15672
```
