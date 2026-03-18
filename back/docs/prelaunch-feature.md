# Prelaunch Feature

## Overview

The prelaunch feature gates the app behind a landing page with email authentication and a referral system. When `PRELAUNCH_ENABLED=true`, all app routes redirect to the prelaunch page. Users enter their email, verify via OTP, and receive a unique referral link to share for tiered rewards.

The `/authenticate` endpoint handles both new registrations and returning users — it always sends a verification OTP regardless of whether the email exists. This prevents email enumeration and acts as a unified register/login flow.

Prelaunch subscribers are **partial Users** — a User with only an email, no password or name. This allows the existing authentication system (Token + Cookie + TokenAuthenticator) to work for prelaunch sessions.

## Environment Variable

```env
PRELAUNCH_ENABLED=false  # Set to true to activate the prelaunch gate
```

Configured in `back/.env`, `docker-compose.yaml`, and `back/config/services.yaml` as parameter `app.prelaunch.enabled`.

## Data Model

### User Entity Changes

Prelaunch subscribers are stored as User records with nullable fields:

| Field | Type | Description |
|-------|------|-------------|
| firstName | string 255 (nullable) | Null for prelaunch subscribers |
| lastName | string 255 (nullable) | Null for prelaunch subscribers |
| password | string 255 (nullable) | Null for prelaunch subscribers |
| referralCode | string 8 (unique, nullable) | Generated hex code for referral system |
| referredBy | ManyToOne (self, nullable) | Self-referencing — the user who referred this person |
| ipAddress | string 45 (nullable) | Stored for IP rate limiting |

Helper method: `User::isPrelaunchSubscriber()` returns `true` when `referralCode !== null && password === null`.

### OTP Integration

The existing `Otp` entity is reused with `OtpType::PrelaunchVerification`. All prelaunch OTPs link to a User (same as login/email verification OTPs). The `OtpService::createAndSend()` method handles the `PrelaunchVerification` case with `PrelaunchVerificationEmailTemplate`.

## Reward Tiers

Defined in `PrelaunchRewardTier` enum (`back/src/Entity/Enum/PrelaunchRewardTier.php`):

| Tier | Referrals | Value |
|------|-----------|-------|
| EarlyBetaAccess | 5 | `early_beta_access` |
| DevDiscordAccess | 10 | `dev_discord_access` |
| LifetimeDiscount | 25 | `lifetime_discount` |

## API Endpoints

Base: `/api/prelaunch` — All endpoints return 404 when `PRELAUNCH_ENABLED=false`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prelaunch/authenticate` | POST | Email authentication — register or login (body: `{ email, referralCode? }`) | Public |
| `/api/prelaunch/status/{referralCode}` | GET | Get referral status + unlocked tiers | Authenticated |
| `/api/prelaunch/check` | GET | Check if prelaunch is enabled | Public |

Public endpoints are listed in `TokenAuthenticator::EXCLUDED_ROUTES`. The `/status` endpoint requires authentication (uses `$this->getUser()`) and goes through `TokenAuthenticator`.

OTP verification uses `/api/otp/verify-prelaunch` (in `OtpController`, same pattern as `verify-login` and `verify-email`). OTP resend uses `/api/otp/resend`. Both are documented in `otp-feature.md`.

## Service

`PrelaunchService` (`back/src/Service/Prelaunch/PrelaunchService.php`):

- **authenticate**: Handles both new and returning users. For existing verified users, sends OTP (acts as login). For new users, checks IP rate limit (max 2 per IP), creates partial User (email only + referralCode), calls `OtpService::createAndSend()` to send verification email
- **getStatus**: Computes referral count via `UserRepository::countVerifiedReferrals()`, determines unlocked tiers, returns `PrelaunchStatusResponseDTO`
- **syncReferrerSegments**: Counts verified referrals, calls `MailingService` to add the referrer to each qualifying tier's Resend segment

## Authentication Flow

1. User submits email → partial User created (if new) → OTP sent
2. Returning user submits email → OTP sent (no new User created)
3. User verifies OTP → `verifiedAt` set → Token created → `X-API-TOKEN` cookie set
4. Frontend calls `/users/me` → TokenAuthenticator validates cookie → user returned with `referralCode`
5. Frontend shows dashboard based on `user.referralCode` presence

## Fraud Prevention

- **IP rate limiting**: Max 2 new registrations per IP address (`UserRepository::countByIpAddress` — filters by `referralCode IS NOT NULL`). Does not apply to returning users
- **Email verification**: OTP required; referral only counts when the referred person verifies
- **Referral count**: Computed dynamically via query (`countVerifiedReferrals`) — only verified users count
- **Duplicate handling**: Unverified prelaunch subscribers with same email are deleted and recreated

## Exceptions

Service code: `160200`

| Exception | Code | HTTP |
|-----------|------|------|
| RateLimitExceededException | 160201 | 429 |
| SubscriberNotFoundException | 160203 | 404 |

OTP exceptions reuse existing hierarchy from `Service/Otp/Exception/`.

## Email Template

`PrelaunchVerificationEmailTemplate` — 6-digit code email with 10-minute expiry, same styling as `EmailVerificationOtpEmailTemplate`.

## Referrer Segment Sync

When a referred user verifies their OTP via `/api/otp/verify-prelaunch`, if the referrer reaches a `PrelaunchRewardTier` threshold, they are added to the corresponding Resend segment for targeted launch emails.

### Flow

```
OtpController::verifyPrelaunch
    → dispatches SyncReferrerSegmentsMessage to RabbitMQ
        → Worker consumes message
            → SyncReferrerSegmentsHandler:
                → PrelaunchService::syncReferrerSegments(referrer)
                    1. Counts verified referrals
                    2. Filters out already-synced tiers (via Redis: RESEND/SYNCED_TIER/{uuid}/{tier})
                    3. If new tiers to sync:
                        → MailingService::ensureContactExists(email, firstName) — once
                        → For each new tier:
                            → MailingService::findOrCreateSegment(name) — cached in Redis
                            → MailingService::addContactToSegment(segmentId, email)
                            → Marks tier as synced in Redis
```

### Optimization

API calls are minimized via two Redis caches:
- **Synced tiers** (`RESEND/SYNCED_TIER/{userUuid}/{tierValue}`): skips already-synced tiers entirely — no API calls for tiers processed in prior syncs
- **Segment IDs** (`RESEND/SEGMENT/{name}`): caches segment name→ID mapping — avoids `segments->list()` on subsequent syncs
- **Contact creation**: called once per sync (before the tier loop), not per tier

| Scenario | API calls |
|----------|-----------|
| Re-sync, no new tiers | 0 |
| Tier 2 just unlocked (warm cache) | 2 (`ensureContact` + `segments->add`) |
| First sync, 3 tiers (cold cache) | 5 (`list` + `ensureContact` + 3× `add`) |

If Redis is flushed, worst case is redundant but idempotent Resend calls.

### Rate Limiting & Retry with Backoff

All Resend API calls in `MailingService` are throttled to 2 req/sec via Symfony RateLimiter (token bucket, Redis-backed). This prevents 429 errors proactively across all worker processes.

As a safety net, when Resend returns a retryable error (429, 500, 502, 503, 504), `MailingService` throws a `MailingRetryableException`. The handler re-dispatches the message with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1st retry | 2s |
| 2nd retry | 4s |
| 3rd retry | 8s |

After 3 retries, the exception is captured via Sentry. The retry count is carried in the `SyncReferrerSegmentsMessage` — the worker is freed between retries (non-blocking).

Same pattern as `GenerateScriptHandler` (see `script-generation-feature.md`).

### Tier → Segment Mapping

Defined in `PrelaunchRewardTier::getSegmentName()`:

| Tier | Threshold | Resend Segment Name |
|------|-----------|---------------------|
| EarlyBetaAccess | 5 | `Prelaunch - Early Beta Access` |
| DevDiscordAccess | 10 | `Prelaunch - Dev Discord Access` |
| LifetimeDiscount | 25 | `Prelaunch - Lifetime Discount` |

### Key Details

- **Async**: The controller dispatches a `SyncReferrerSegmentsMessage` — Resend API calls do not block the OTP verification response
- **Retryable**: 429 and 5xx errors from Resend trigger automatic retry with exponential backoff (max 3 retries)
- **Idempotent**: Resend global contacts are identified by email — creating an existing contact is a no-op, adding to a segment they're already in is safe
- **Error handling**: Permanent failures and retries exhausted are sent to Sentry
- **Trigger**: Only dispatched when the verified user has a `referredBy` referrer

See `mailing-feature.md` for Resend SDK and segment management details.

## Deactivation

1. Set `PRELAUNCH_ENABLED=false`
2. Restart containers
3. App works normally; prelaunch endpoints return 404, frontend stops redirecting
