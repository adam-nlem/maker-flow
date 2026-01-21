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

- `rabbitmq` - RabbitMQ server with management UI
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

            failed:
                dsn: 'doctrine://default?queue_name=failed'

        routing:
            # 'App\Message\YourMessage': async
```

---

## Usage

### Creating a Message

Messages are simple PHP classes that hold data:

```php
<?php

namespace App\Module\YourModule\Message;

final class YourMessage
{
    public function __construct(
        private readonly string $entityUuid,
    ) {}

    public function getEntityUuid(): string
    {
        return $this->entityUuid;
    }
}
```

### Creating a Message Handler

Handlers process messages:

```php
<?php

namespace App\Module\YourModule\MessageHandler;

use App\Module\YourModule\Message\YourMessage;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final class YourMessageHandler
{
    public function __construct(
        private readonly YourService $yourService,
    ) {}

    public function __invoke(YourMessage $message): void
    {
        // Process the message
        $this->yourService->process($message->getEntityUuid());
    }
}
```

### Routing Messages to Transport

Add routing in `config/packages/messenger.yaml`:

```yaml
framework:
    messenger:
        routing:
            'App\Module\YourModule\Message\YourMessage': async
```

### Dispatching Messages

```php
use Symfony\Component\Messenger\MessageBusInterface;

class YourController
{
    public function __construct(
        private readonly MessageBusInterface $messageBus,
    ) {}

    public function someAction(): Response
    {
        $this->messageBus->dispatch(new YourMessage($entityUuid));
        
        return $this->json(['status' => 'queued']);
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
│       └── messenger.yaml          # Messenger configuration
└── src/
    └── Module/
        └── [ModuleName]/
            ├── Message/            # Message classes
            │   └── YourMessage.php
            └── MessageHandler/     # Message handlers
                └── YourMessageHandler.php
```
