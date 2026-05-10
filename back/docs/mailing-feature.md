# Mailing Feature

## Overview

Email sending via Symfony Mailer with the [Resend](https://resend.com) transport (`symfony/resend-mailer`). Emails are dispatched asynchronously through RabbitMQ via Symfony Messenger. Segment/contact management (for marketing emails) uses the `resend/resend-php` SDK directly.

## Architecture

### Email Sending

```
Caller (OtpService, EventSubscriber, etc.)
    → creates an email template (extends AbstractEmailTemplate)
    → dispatches SendEmailMessage(template) to RabbitMQ
        → Worker consumes message
            → SendEmailHandler calls template->toEmail()
                → MailingService::send(Email)
                    → Symfony Mailer (Resend transport) delivers the email
```

Callers create a template and dispatch `SendEmailMessage` with it to the message bus. `SendEmailHandler` converts the template to an `Email` and delegates to `MailingService::send()` which applies from-address defaulting and sends via Symfony Mailer.

### Segment Management

```
MailingService::findOrCreateSegment(name) → Redis cache or Resend Segments API
MailingService::ensureContactExists(email, firstName) → Resend Contacts API
MailingService::addContactToSegment(segmentId, email) → Resend Segments API
```

Segment methods call the Resend API directly (no async layer). They are called from within `SyncReferrerSegmentsHandler`, which runs asynchronously via RabbitMQ.

Contacts are global in Resend (identified by email, not tied to a single segment). Segment IDs are cached in Redis (`RESEND/SEGMENT/{name}`) to avoid repeated `segments->list()` calls.

All Resend API calls (email sending + segment SDK) are throttled via Symfony RateLimiter (`token_bucket`, 2 req/sec, Redis-backed) to respect Resend's rate limit. The `throttle()` method calls `$limiter->reserve()->wait()` before each API call — it blocks until a token is available. This works across all worker processes sharing the same Redis instance.

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MAILER_DSN` | Symfony Mailer transport DSN | `resend+api://RE_API_KEY@default` |
| `RESEND_API_KEY` | Resend API key (used by MAILER_DSN and segment SDK) | `re_123456789` |
| `MAILING_FROM_ADDRESS` | Default sender email address | `noreply@yourdomain.com` |
| `MAILING_FROM_NAME` | Default sender display name | `MakerFlow` |

### Files

| File | Purpose |
|------|---------|
| `back/.env` | Env var placeholders |
| `docker-compose.yaml` | Passes env vars to back container |
| `config/packages/messenger.yaml` | Transport config (RabbitMQ) |
| `config/packages/mailer.yaml` | Symfony Mailer DSN config |
| `config/services.yaml` | `Resend\Client` factory, `app.mailing.*` parameters, `MailingService` wiring |
| `config/packages/rate_limiter.yaml` | Resend API rate limiter config (token_bucket, 2 req/sec) |
| `config/packages/cache.yaml` | Redis-backed cache pool for rate limiter |

### Service Configuration

```yaml
# config/services.yaml
Resend\Client:
    factory: ['Resend', 'client']
    arguments: ['%app.resend.api_key%']
```

## File Structure

```
src/Service/Mailing/
├── MailingService.php                    # Email sending (Symfony Mailer) + segment management (Resend SDK)
├── Template/                            # Email templates
│   ├── AbstractEmailTemplate.php        # Base template class
│   ├── LoginOtpEmailTemplate.php
│   ├── EmailVerificationOtpEmailTemplate.php
│   ├── PrelaunchVerificationEmailTemplate.php
│   ├── IntegrationTokenExpiredEmailTemplate.php
│   ├── CollaboratorWelcomeEmailTemplate.php
│   └── ClientWelcomeEmailTemplate.php
└── Exception/
    ├── MailingServiceException.php       # Abstract base exception (code 140200)
    └── MailingRetryableException.php     # Thrown on retryable Resend errors (429, 5xx)

src/Message/
├── SendEmailMessage.php                 # Async email dispatch message (carries AbstractEmailTemplate)
├── SyncReferrerSegmentsMessage.php      # Async referrer segment sync (with retryCount)
└── Handler/
    ├── SendEmailHandler.php             # Delegates to MailingService::send()
    └── SyncReferrerSegmentsHandler.php  # Syncs referrer segments with retry/backoff
```

## Usage

### Sending Emails (async)

Inject `MessageBusInterface` and dispatch a `SendEmailMessage` with the template:

```php
$template = new LoginOtpEmailTemplate($user->getEmail(), $user->getFirstName(), $code);

$this->messageBus->dispatch(new SendEmailMessage($template));
```

The from-address is handled by `MailingService::send()` — callers don't need to know about it.

### Managing Segments

```php
$segmentId = $this->mailingService->findOrCreateSegment('My Segment');
$this->mailingService->addContactToSegment($segmentId, 'user@example.com', 'John');
```

## Key Details

- **Email transport**: Symfony Mailer with `symfony/resend-mailer` transport
- **Segment SDK**: `resend/resend-php` for segment/contact management (no Symfony equivalent)
- **Async emails**: Callers dispatch `SendEmailMessage(template)` to RabbitMQ, `SendEmailHandler` converts template to `Email` and calls `MailingService::send()`
- **SendEmailMessage**: Carries an `AbstractEmailTemplate` — callers just pass the template, no raw strings or from-address config needed
- **MailingService::send()**: Applies from-address defaulting, then sends via `MailerInterface` — used by `SendEmailHandler`
- **Rate limiting**: Resend SDK calls are throttled to 2 req/sec via Symfony RateLimiter (token bucket, Redis-backed). Configured in `config/packages/rate_limiter.yaml`
- **Retry**: `SyncReferrerSegmentsHandler` retries on `MailingRetryableException` (429, 5xx) with exponential backoff (2s, 4s, 8s). Email sending uses the Messenger retry strategy (3 retries, 1s delay, 2x multiplier)
- **From address**: Configurable via env vars, applied only by `MailingService::send()` — callers don't handle from-address
- **Segments**: Managed via Resend Segments API (replaces deprecated Audiences API), used for prelaunch referral tier rewards
- **Global contacts**: Resend contacts are identified by email and exist independently of segments
- **Exception code**: `140200` (follows existing pattern: Stripe=130200, Credit=120200)
