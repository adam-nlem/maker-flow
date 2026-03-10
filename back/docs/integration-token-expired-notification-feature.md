# Integration Token Expired Notification Feature

## Overview

When a social media integration's OAuth token expires or is revoked, the system automatically notifies the user via email with a link to reconnect their account. This prevents silent data loss during insight fetching.

## Architecture

```
OAuth Service (token refresh fails) ─────┐
                                          ├─→ throws OAuthTokenRevokedException
Insight Service (API call returns 401/403)┘
                                          ↓
Message Handler catches OAuthTokenRevokedException
                                          ↓
Dispatches IntegrationTokenExpiredEvent
                                          ↓
IntegrationTokenExpiredSubscriber → MailingService (async via RabbitMQ)
```

## Two Failure Modes Handled

### 1. Token Refresh Failure
When `refreshTokenIfNeeded()` fails (token expired beyond renewal), the OAuth service sets the integration status to `Revoked` and throws `OAuthTokenRevokedException`. Already existed before this feature.

### 2. API Call Auth Error
When a user manually revokes access on Instagram/YouTube, the token isn't technically expired so refresh passes, but the actual API call fails with 401/403. The insight services (`IntegrationInsightService`, `PostInsightService`) now catch these auth errors, mark the integration as `Revoked`, and throw `OAuthTokenRevokedException`.

## Key Files

| File | Purpose |
|------|---------|
| `Event/IntegrationTokenExpiredEvent.php` | Event dispatched when a token is detected as expired/revoked |
| `EventSubscriber/IntegrationTokenExpiredSubscriber.php` | Listens to the event, sends notification email |
| `Service/Mailing/Template/IntegrationTokenExpiredEmailTemplate.php` | Email template with reconnect CTA |
| `Message/Handler/FetchIntegrationInsightsHandler.php` | Catches `OAuthTokenRevokedException`, dispatches event |
| `Message/Handler/FetchPostInsightsHandler.php` | Same as above |
| `Service/IntegrationInsight/IntegrationInsightService.php` | Catches 401/403 from Instagram/YouTube API calls |
| `Service/PostInsight/PostInsightService.php` | Catches 401/403 from Instagram/YouTube API calls |

## Event

```php
class IntegrationTokenExpiredEvent extends Event
{
    public const NAME = 'integration.token_expired';
    // Holds the Integration entity
}
```

Dispatched from the message handlers when catching `OAuthTokenRevokedException` (single convergence point).

## Email Template

- **Subject**: `MakerFlow — Reconnexion requise pour votre compte {platform}`
- **Body**: Greeting, explanation, CTA button linking to `/settings/integrations`, reassurance about existing data
- **Style**: Inline HTML matching existing email templates (same colors, fonts, layout)

## Auth Error Detection

### Instagram (Symfony HttpClient)
```php
catch (ClientExceptionInterface $e) {
    if (in_array($e->getResponse()->getStatusCode(), [401, 403], true)) {
        // Mark as Revoked + throw OAuthTokenRevokedException
    }
}
```

### YouTube (Google PHP Client)
```php
catch (\Google\Service\Exception $e) {
    if (in_array($e->getCode(), [401, 403], true)) {
        // Mark as Revoked + throw OAuthTokenRevokedException
    }
}
```

## Configuration

`config/services.yaml` — `IntegrationTokenExpiredSubscriber` receives `$frontendUrl` to build the reconnect link.

## Flow Summary

1. Cron dispatches `FetchIntegrationInsightsMessage` / `FetchPostInsightsMessage`
2. Handler calls insight service
3. Insight service calls `refreshTokenIfNeeded()` (may throw) then makes API calls (may throw on 401/403)
4. On `OAuthTokenRevokedException`: handler dispatches `IntegrationTokenExpiredEvent`
5. Subscriber sends email via `MailingService` (async via RabbitMQ)
6. User receives email with reconnect link → clicks → lands on integration settings page
