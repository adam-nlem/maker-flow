# Integration Events Feature

## Overview

This feature provides a decoupled event system for integration lifecycle events. Features can subscribe to these events without coupling the core integration code to feature-specific logic.

---

## Architecture

```
IntegrationController (callback)
    └── Dispatches IntegrationCreatedEvent
        └── EventSubscribers listen and react
            └── Feature-specific logic (e.g., dispatch messages)
```

### Flow Diagram

```
+-------------------------------------+
|     IntegrationController           |
|     (OAuth callback success)        |
+-----------------+-------------------+
                  | dispatch()
                  v
+-------------------------------------+
|     IntegrationCreatedEvent         |
|     (contains Integration entity)   |
+-----------------+-------------------+
                  | subscribed
                  v
+-------------------------------------+
|  IntegrationCreatedSubscriber       |
|  (insights feature)                 |
+-----------------+-------------------+
                  | dispatch messages
                  v
+-------------------------------------+
|  FetchIntegrationInsightsMessage    |
|  FetchPostInsightsMessage           |
+-------------------------------------+
```

---

## Components

### Events

| Event | Description |
|-------|-------------|
| `IntegrationCreatedEvent` | Dispatched when a new integration is successfully created via OAuth callback |

### Event Subscribers

| Subscriber | Feature | Description |
|------------|---------|-------------|
| `IntegrationCreatedSubscriber` | Insights | Dispatches insight fetch messages for Instagram integrations |

---

## Files

```
src/
├── Event/
│   └── IntegrationCreatedEvent.php
└── EventSubscriber/
    └── IntegrationCreatedSubscriber.php
```

---

## Usage

### Creating a New Event

```php
<?php

namespace App\Event;

use App\Entity\Integration;
use Symfony\Contracts\EventDispatcher\Event;

class IntegrationCreatedEvent extends Event
{
    public const NAME = 'integration.created';

    public function __construct(
        private readonly Integration $integration,
    ) {}

    public function getIntegration(): Integration
    {
        return $this->integration;
    }
}
```

### Dispatching an Event

```php
use App\Event\IntegrationCreatedEvent;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

public function callback(
    EventDispatcherInterface $eventDispatcher,
): Response {
    // ... create integration ...

    $eventDispatcher->dispatch(
        new IntegrationCreatedEvent($integration),
        IntegrationCreatedEvent::NAME
    );

    // ...
}
```

### Creating an Event Subscriber

```php
<?php

namespace App\EventSubscriber;

use App\Entity\Enum\IntegrationProvider;
use App\Event\IntegrationCreatedEvent;
use App\Message\FetchIntegrationInsightsMessage;
use App\Message\FetchPostInsightsMessage;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\MessageBusInterface;

class IntegrationCreatedSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly MessageBusInterface $bus,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            IntegrationCreatedEvent::NAME => 'onIntegrationCreated',
        ];
    }

    public function onIntegrationCreated(IntegrationCreatedEvent $event): void
    {
        $integration = $event->getIntegration();

        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            return;
        }

        $this->bus->dispatch(new FetchIntegrationInsightsMessage($integration->getId()));
        $this->bus->dispatch(new FetchPostInsightsMessage($integration->getId()));
    }
}
```

---

## Conventions

1. **Event classes** located in `src/Event/`
2. **Event naming** follows pattern: `{Entity}{Action}Event` (e.g., `IntegrationCreatedEvent`)
3. **Event constant** `NAME` follows pattern: `{entity}.{action}` (e.g., `integration.created`)
4. **Subscribers** located in `src/EventSubscriber/`
5. **Subscriber naming** follows pattern: `{EventName}Subscriber` (e.g., `IntegrationCreatedSubscriber`)
6. **Filter by provider** in subscriber if logic is provider-specific

---

## Benefits

- **Decoupling**: Core code doesn't know about feature-specific logic
- **Extensibility**: Multiple features can subscribe to the same event
- **Testability**: Events and subscribers can be tested independently
- **Single Responsibility**: Each subscriber handles one concern
