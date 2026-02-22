# RabbitMQ & Symfony Messenger Integration

## Overview

This document describes the RabbitMQ message queue integration using Symfony Messenger for asynchronous task processing in the MakerFlow application.

---

## Architecture

### Components

| Component | Description |
|-----------|-------------|
| **RabbitMQ** | Message broker service for queue management |
| **Symfony Messenger** | PHP message bus for dispatching and handling messages |
| **Messenger Worker** | Process that consumes messages from the queue (runs in back container) |

### Docker Services

- `rabbitmq` - RabbitMQ server with management UI (port 15672)
- `back` - Main backend container (also runs the messenger worker)

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RABBITMQ_USER` | RabbitMQ username | `maker_flow` |
| `RABBITMQ_PASSWORD` | RabbitMQ password | `maker_flow` |
| `RABBITMQ_VHOST` | RabbitMQ virtual host | `maker_flow` |
| `MESSENGER_TRANSPORT_DSN` | Full AMQP connection string | Auto-generated |

### Transport Configuration

Located in `config/packages/messenger.yaml`:

```yaml
framework:
    messenger:
        failure_transport: failed

        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    delay: 1000
                    multiplier: 2
                    max_delay: 0
                options:
                    exchange:
                        name: messages
                        type: direct
                    queues:
                        messages:
                            binding_keys: [messages]

            failed:
                dsn: 'doctrine://default?queue_name=failed'

        routing:
            # Messages are routed via #[AsMessage('async')] attribute on message classes
```

Messages are routed via the `#[AsMessage('async')]` attribute on each message class, eliminating the need for manual routing configuration.

---

## Usage

### Creating a Message

Messages are simple PHP classes that hold data. Place them in `src/Message/`.

Use the `#[AsMessage('async')]` attribute to automatically route messages to the async transport:

```php
<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('async')]
class FetchIntegrationInsightsMessage
{
    public function __construct(
        private int $integrationId,
    ) {}

    public function getIntegrationId(): int
    {
        return $this->integrationId;
    }
}
```

This eliminates the need to manually add routing entries in `messenger.yaml`.

### Creating a Message Handler

Handlers process messages. Place them in `src/Message/Handler/`:

```php
<?php

namespace App\Message\Handler;

use App\Message\FetchIntegrationInsightsMessage;
use App\Service\IntegrationInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchIntegrationInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly IntegrationInsightService $integrationInsightService,
    ) {}

    public function __invoke(FetchIntegrationInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getById($message->getIntegrationId());

        if ($integration === null) {
            return;
        }

        $this->integrationInsightService->fetchInstagramProfileInsights($integration);
    }
}
```

### Dispatching Messages

Inject `MessageBusInterface` and dispatch messages:

```php
use Symfony\Component\Messenger\MessageBusInterface;

class FetchIntegrationInsightsCommand extends Command
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly MessageBusInterface $bus,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $integrations = $this->integrationRepository->getByPlatform(Platform::Instagram);

        foreach ($integrations as $integration) {
            $this->bus->dispatch(new FetchIntegrationInsightsMessage($integration->getId()));
        }

        return Command::SUCCESS;
    }
}
```

---

## Commands

### Worker Management

```bash
# Start consuming messages (in back container)
dce back php bin/console messenger:consume async -vv

# Start worker with limits (recommended for production)
dce back php bin/console messenger:consume async --time-limit=3600 --memory-limit=256M -vv

# Stop workers gracefully
dce back php bin/console messenger:stop-workers

# View failed messages
dce back php bin/console messenger:failed:show

# Retry failed messages
dce back php bin/console messenger:failed:retry

# Remove a failed message
dce back php bin/console messenger:failed:remove {id}
```

### Queue Management

```bash
# Setup transports (create queues/exchanges)
dce back php bin/console messenger:setup-transports
```

---

## RabbitMQ Management UI

Access the RabbitMQ management interface at: `http://localhost:15672`

- **Username**: Value of `RABBITMQ_USER` env variable
- **Password**: Value of `RABBITMQ_PASSWORD` env variable

---

## Production Considerations

### Security

1. **Change default credentials** in production environment
2. **Use strong passwords** for RabbitMQ user
3. **Restrict management UI access** in production (consider removing port 15672 mapping)
4. **Use TLS** for AMQP connections in production (`amqps://`)

### Reliability

1. **Retry strategy** configured with exponential backoff (3 retries, 1s initial delay, 2x multiplier)
2. **Failed transport** stores failed messages in database for manual review
3. **Health checks** configured for RabbitMQ container
4. **Worker auto-restart** via Docker's `restart: unless-stopped`

### Performance

1. **Time limit**: Worker restarts every hour (`--time-limit=3600`)
2. **Memory limit**: Worker restarts at 256MB (`--memory-limit=256M`)
3. **Multiple workers**: Scale by running multiple worker containers

### Scaling Workers

To run multiple worker processes, open multiple terminal sessions and run:

```bash
dce back php bin/console messenger:consume async --time-limit=3600 --memory-limit=256M -vv
```

For production, consider using a process manager like Supervisor inside the container.

---

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure RabbitMQ container is running and healthy
2. **Authentication failed**: Verify credentials in environment variables
3. **Messages not being consumed**: Ensure the worker is running in the back container

### Useful Commands

```bash
# Check RabbitMQ status
docker compose exec rabbitmq rabbitmqctl status

# List queues
docker compose exec rabbitmq rabbitmqctl list_queues

# Check back container logs
docker compose logs -f back
```

---

## File Structure

```
back/
├── config/
│   └── packages/
│       └── messenger.yaml              # Messenger configuration
└── src/
    ├── Command/
    │   ├── FetchIntegrationInsightsCommand.php
    │   └── FetchPostInsightsCommand.php
    └── Message/
        ├── FetchIntegrationInsightsMessage.php
        ├── FetchPostInsightsMessage.php
        └── Handler/
            ├── FetchIntegrationInsightsHandler.php
            └── FetchPostInsightsHandler.php
```


