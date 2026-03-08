# Sentry Error Tracking (Backend)

## Overview

Sentry is integrated via the `sentry/sentry-symfony` bundle to capture and report errors from the Symfony backend, including HTTP requests, console commands, and async Messenger workers.

## Configuration

### Environment Variable

| Variable | Location | Description |
|----------|----------|-------------|
| `SENTRY_DSN` | `back/.env`, `docker-compose.yaml` | Sentry DSN. Empty = disabled |

### Bundle Config

**File**: `config/packages/sentry.yaml`

```yaml
sentry:
    dsn: '%env(SENTRY_DSN)%'
    options:
        environment: '%kernel.environment%'
        send_default_pii: true
        traces_sample_rate: 0.2
        before_send: '@App\Sentry\SentryBeforeSendCallback'
```

- `environment` maps to Symfony's `dev`/`prod` environment
- `send_default_pii: true` includes user IP and user agent
- `traces_sample_rate: 0.2` captures 20% of transactions for performance monitoring
- When DSN is empty, the SDK is fully inactive (no events sent)

## Exception Filtering

**File**: `src/Sentry/SentryBeforeSendCallback.php`

The `before_send` callback filters out expected exceptions before they reach Sentry:

| Exception Type | Reported | Reason |
|---------------|----------|--------|
| 4xx `HttpExceptionInterface` | No | Client errors (bad request, unauthorized, not found, etc.) |
| `CustomValidationException` | No | Expected DTO validation failures |
| 5xx errors | Yes | Server bugs |
| All other exceptions | Yes | Unexpected errors |

## User Context

**File**: `src/EventSubscriber/SentryUserContextSubscriber.php`

On every main request, the authenticated user's UUID and email are attached to the Sentry scope. This allows filtering and searching Sentry events by user.

## Messenger Worker Integration

The `sentry-symfony` bundle automatically captures unhandled exceptions in Messenger workers. For exceptions that are caught and logged (swallowed), `\Sentry\captureException($e)` is called explicitly:

| Handler | Exceptions Captured |
|---------|-------------------|
| `FetchPostInsightsHandler` | All caught exceptions |
| `FetchIntegrationInsightsHandler` | All caught exceptions |
| `ProcessStripeWebhookHandler` | All caught exceptions (re-thrown after capture) |
| `GenerateScriptHandler` | Unexpected errors, max retry failures, refund failures |

`InsufficientCreditsException` and `AiClientRetryableException` (before max retries) are **not** reported as they represent expected business flows.

## Key Files

| File | Purpose |
|------|---------|
| `config/packages/sentry.yaml` | Bundle configuration |
| `src/Sentry/SentryBeforeSendCallback.php` | Exception filtering |
| `src/EventSubscriber/SentryUserContextSubscriber.php` | User context per request |
