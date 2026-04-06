# Scheduler Feature

## Overview

Automated scheduling of recurring tasks using the **Symfony Scheduler** component. The scheduler runs as a dedicated Docker container that consumes the `scheduler_default` Messenger transport, triggering Symfony console commands on a cron schedule.

## Architecture

```
Scheduler container (messenger:consume scheduler_default)
  ├── Every hour   → RunCommandMessage('app:social-analytics:fetch-post-insights')
  └── Daily 3AM UTC → RunCommandMessage('app:social-analytics:fetch-integration-insights')
                            ↓
                   Console command executes
                            ↓
                   Messages dispatched to RabbitMQ
                            ↓
                   Worker containers process insights
```

The scheduler uses `RunCommandMessage` (from `symfony/console`) to execute existing CLI commands directly. This avoids creating custom schedule messages/handlers — the existing commands remain the single source of truth.

## Key Files

| File | Purpose |
|------|---------|
| `src/Schedule.php` | Schedule provider — defines cron expressions and commands |
| `config/packages/cache.yaml` | Redis cache pool `cache.scheduler` for stateful scheduling |

## Schedule Provider

Located at `src/Schedule.php`, annotated with `#[AsSchedule]`. This auto-registers a `scheduler_default` Messenger transport.

### Scheduled Tasks

| Cron Expression | Command | Frequency |
|-----------------|---------|-----------|
| `0 * * * *` | `app:social-analytics:fetch-post-insights` | Every hour at :00 |
| `0 3 * * *` | `app:social-analytics:fetch-integration-insights` | Daily at 03:00 UTC |

### Stateful Scheduling

The schedule uses `->stateful($cache)` backed by a dedicated Redis cache pool (`cache.scheduler`). This ensures:

- **Catch-up on missed runs**: If the scheduler container restarts, it executes any missed scheduled tasks on the next poll
- **No duplicate runs**: Redis-backed locking prevents the same task from running twice
- **`processOnlyLastMissedRun(true)`**: If multiple runs were missed during downtime, only the most recent one executes (avoids flooding RabbitMQ with duplicate messages)

## Production Deployment

### Docker Compose Service

The scheduler runs as a dedicated service in `docker-compose.prod.yaml`:

```yaml
scheduler:
  <<: *back-common
  command: ["php", "bin/console", "messenger:consume", "scheduler_default", "--time-limit=3600", "--memory-limit=256M", "-vv"]
  deploy:
    replicas: 1   # Must be exactly 1
```

**Important**: The scheduler must run as exactly **1 replica** to prevent duplicate scheduled runs. Unlike the `worker` service (2 replicas), the scheduler should never be scaled horizontally.

### CI/CD

The scheduler is stopped, recreated, and rolled back alongside the `worker` service in `.github/workflows/build-and-push.yml`.

## Adding New Scheduled Tasks

1. Open `src/Schedule.php`
2. Add a new `RecurringMessage::cron()` entry in `getSchedule()`:
   ```php
   ->add(RecurringMessage::cron(
       '*/30 * * * *',
       new RunCommandMessage('app:your-command')
   ))
   ```
3. The command must already exist as a Symfony console command

## Local Development

Run the scheduler locally to test:

```bash
dce back php bin/console messenger:consume scheduler_default -vv
```

The scheduler will pick up the schedule and dispatch commands at the configured intervals.

## Dependencies

- `symfony/scheduler` — Scheduler component
- `dragonmantank/cron-expression` — Cron expression parser (required by `RecurringMessage::cron()`)
