# Prelaunch Feature

## Overview

A prelaunch landing page that gates the entire app when `VITE_PRELAUNCH_ENABLED=true`. Users enter their email, verify via OTP, and access a referral dashboard with tiered rewards.

The authenticate endpoint handles both new registrations and returning users — it always sends a verification OTP regardless of whether the email exists. This prevents email enumeration and acts as a unified register/login flow.

Prelaunch subscribers are partial Users (email only, no password/name). After OTP verification, the backend sets the `X-API-TOKEN` cookie, so `useCurrentUser()` works to detect the prelaunch session.

## Environment Variable

```env
VITE_PRELAUNCH_ENABLED=false  # Set to true to activate
```

Configured in `front/.env` and `docker-compose.yaml`.

## Route

- Path: `/prelaunch` (public route in `routes.ts`)
- Route path constant: `prelaunchPath` in `routePaths.ts`

## Route Gating

All routes are gated in `root.tsx`:
- When `VITE_PRELAUNCH_ENABLED=true` and `location.pathname !== prelaunchPath`, redirects to `/prelaunch`
- This covers both authenticated and public routes (login, register, etc.)

## Page Flow

Two pages on the `/prelaunch` route, derived from server state:
1. `useCurrentUser()` returns user with `referralCode` → **dashboard page**
2. Default → **landing page** (authenticate)

OTP verification reuses the existing auth `/verify-otp` page with `OtpType.PrelaunchVerification`. After verification, navigates back to `/prelaunch` which shows the dashboard.

## Components

All in `components/prelaunch/`:

| Component | Props | Description |
|-----------|-------|-------------|
| `PrelaunchAuthenticateStep` | `referralCodeFromUrl: string \| null` | Landing page with feature cards + email form. Navigates to `/verify-otp` on success. |
| `PrelaunchDashboardStep` | `referralCode: string` | Referral dashboard (link, count, tier progress, share buttons) |
| `PrelaunchRewardTierCard` | `label, description, threshold, isUnlocked` | Individual reward tier display (locked/unlocked states) |

## API Hooks

| Hook | Type | Endpoint |
|------|------|----------|
| `useAuthenticatePrelaunch` | Mutation | `POST /prelaunch/authenticate` |
| `useVerifyOtp` (shared) | Mutation | `POST /otp/verify-prelaunch` (via `OtpType.PrelaunchVerification`) |
| `useResendOtp` (shared) | Mutation | `POST /otp/resend` (reuses existing OTP resend) |
| `usePrelaunchStatus` | Query | `GET /prelaunch/status/{referralCode}` |
| `useCheckPrelaunch` | Query | `GET /prelaunch/check` |

Query keys: `prelaunchQueryKeys` in `hooks/api/prelaunch/prelaunchQueryKeys.ts`.

### Verify Flow

1. `PrelaunchAuthenticateStep` navigates to `/verify-otp` with `purpose: OtpType.PrelaunchVerification`
2. `VerifyOtpForm` uses shared `useVerifyOtp` → calls `POST /otp/verify-prelaunch` → backend sets `X-API-TOKEN` cookie
3. On success: navigates to `/prelaunch`
4. `useCurrentUser()` returns user with `referralCode` → dashboard page shown

## Models & DTOs

| File | Description |
|------|-------------|
| `models/User.ts` | User model with `referralCode: string \| null`, nullable `firstName`/`lastName`, `isPrelaunchSubscriber` getter |
| `models/enums/PrelaunchRewardTier.ts` | Enum with labels, descriptions, thresholds |
| `models/dtos/AuthenticatePrelaunchResponseDTO.ts` | `{ pendingOtpToken, email }` |
| `models/dtos/PrelaunchStatusResponseDTO.ts` | Full status with unlocked tiers |

## Reward Tiers

| Tier | Referrals | Label |
|------|-----------|-------|
| `EarlyBetaAccess` | 5 | Accès anticipé à la bêta |
| `DevDiscordAccess` | 10 | Accès au Discord développeurs |
| `LifetimeDiscount` | 25 | 20% de réduction à vie |

## Deactivation

Set `VITE_PRELAUNCH_ENABLED=false` and restart. The app works normally; `/prelaunch` redirects to `/`.
