# Mailing Feature

## Overview

Email infrastructure using [Resend](https://resend.com) as the email provider, integrated via the Symfony Mailer Bridge (`symfony/resend-mailer`). Emails are dispatched asynchronously through RabbitMQ via Symfony Messenger.

## Architecture

```
MailingService::send(Email)
    → MailerInterface::send()
        → Messenger dispatches SendEmailMessage to RabbitMQ
            → Worker consumes message
                → Resend API delivers the email
```

The async flow is transparent: calling `MailingService::send()` queues the email via Messenger. The `messenger:consume` worker processes the queue and sends emails through Resend.

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MAILER_DSN` | Symfony Mailer DSN for Resend | `resend+api://API_KEY@default` |
| `MAILING_FROM_ADDRESS` | Default sender email address | `noreply@yourdomain.com` |
| `MAILING_FROM_NAME` | Default sender display name | `MakerFlow` |

### Files

| File | Purpose |
|------|---------|
| `back/.env` | Env var placeholders |
| `docker-compose.yaml` | Passes env vars to back container |
| `config/packages/mailer.yaml` | Mailer DSN config |
| `config/packages/messenger.yaml` | Async routing for `SendEmailMessage` → `messages` transport |
| `config/services.yaml` | `app.mailing.*` parameters + `MailingService` definition |

### Messenger Routing

```yaml
# config/packages/messenger.yaml
routing:
    'Symfony\Component\Mailer\Messenger\SendEmailMessage': messages
```

Explicit YAML routing is required because `SendEmailMessage` is a Symfony framework class (cannot use `#[AsMessage]` attribute).

## File Structure

```
src/Service/Mailing/
├── MailingService.php                    # Email sending wrapper
└── Exception/
    └── MailingServiceException.php       # Abstract base exception (code 140200)
```

## Usage

Inject `MailingService` and call `send()` with a `Symfony\Component\Mime\Email` object:

```php
use App\Service\Mailing\MailingService;
use Symfony\Component\Mime\Email;

final class SomeService
{
    public function __construct(
        private readonly MailingService $mailingService,
    ) {}

    public function notifyUser(string $recipientEmail): void
    {
        $email = (new Email())
            ->to($recipientEmail)
            ->subject('Hello')
            ->html('<p>Hello from MakerFlow!</p>');

        $this->mailingService->send($email);
    }
}
```

The "from" address is set automatically from `MAILING_FROM_ADDRESS` / `MAILING_FROM_NAME` if not already set on the Email object.

## Key Details

- **Provider**: Resend (via `symfony/resend-mailer` bridge)
- **Async**: Emails queued in RabbitMQ, processed by `messenger:consume` worker
- **Retry**: Uses the existing Messenger retry strategy (3 retries, 1s delay, 2x multiplier)
- **From address**: Configurable via env vars, automatically applied by `MailingService`
- **Exception code**: `140200` (follows existing pattern: Stripe=130200, Credit=120200)

## Future Extensions

- Add Twig templates for email content (requires `symfony/twig-bundle`)
- Add webhook handling for delivery events (`symfony/webhook`)
- Create specific email types (welcome, password reset, notifications)
- Add `EmailLog` entity for audit trail
