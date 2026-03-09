# OTP Feature (Backend)

## Overview

OTP (One-Time Password) system providing two security layers:
1. **2FA on login** — Mandatory for all users. After valid email/password, a 6-digit OTP is sent to the user's email. Login completes only after OTP verification.
2. **Email verification on registration** — New users are blocked from the app until they verify their email via OTP.

## OTP Specification

- **Format**: 6-digit numeric code (zero-padded)
- **Expiration**: 10 minutes
- **Max attempts**: 5 per OTP
- **Delivery**: Email via MailingService (Resend + RabbitMQ async)
- **Storage**: Plaintext (short-lived + attempt-limited)

## Architecture

### Entities

**`OtpType` enum** (`Entity/Enum/OtpType.php`)
- `Login` — for 2FA on login
- `EmailVerification` — for email verification on registration

**`Otp` entity** (`Entity/Otp.php`)
- `uuid` — public identifier
- `code` — 6-digit OTP code
- `type` — OtpType enum
- `pendingOtpToken` — random 64-char hex string, used as session identifier
- `attempts` — failed verification counter
- `usedAt` — nullable, set on successful verification
- `expiresAt` — creation time + 10 minutes
- `createdAt` — auto-set
- `user` — ManyToOne to User, CASCADE delete

**`User` entity changes**
- Added `verifiedAt` (nullable DateTimeImmutable) — set when email is verified
- Added `isVerified(): bool` convenience method
- Added `otps` OneToMany relation
- Serialization groups: `api_otp_verify_login`, `api_otp_verify_email` on user fields (uuid, firstName, lastName, email, createdAt, verifiedAt)

### Service

**`OtpService`** (`Service/Otp/OtpService.php`)
- `createAndSend(User, OtpType): Otp` — Invalidates existing OTPs for user+type, generates code + pendingOtpToken (with uniqueness check via `generateUniquePendingToken()`), persists, sends email via template, returns entity
- `verify(string $pendingOtpToken, string $code): Otp` — Validates token existence, usedAt, attempts, expiry, code match. Throws specific exceptions on failure.
- `generateUniquePendingToken(): string` — Generates a unique 64-char hex token with do-while collision check

### Exceptions (`Service/Otp/Exception/`)

| Exception | Code | HTTP Status |
|-----------|------|-------------|
| `OtpServiceException` (abstract) | 150200 | — |
| `InvalidOtpException` | 150201 | 422 |
| `ExpiredOtpException` | 150202 | 422 |
| `MaxAttemptsOtpException` | 150203 | 429 |
| `InvalidPendingTokenException` | 150204 | 401 |

### Email Templates (`Service/Mailing/Template/`)

- `AbstractEmailTemplate` — Base class with `toEmail()` builder, `getSubject()` and `getHtmlBody()` abstract methods
- `LoginOtpEmailTemplate` — "Votre code de connexion MakerFlow"
- `EmailVerificationOtpEmailTemplate` — "Vérifiez votre adresse email - MakerFlow"

### Request DTOs (`DTO/Request/Otp/`)

- `VerifyOtpRequestDTO` — fields: `pendingOtpToken`, `code`
- `ResendOtpRequestDTO` — field: `pendingOtpToken`

### Response DTOs

- `ResendOtpResponseDTO` (`DTO/Response/Otp/`) — `{ pendingOtpToken }`
- `LoginResponseDTO` (`DTO/Response/User/`) — `{ requiresOtp, requiresEmailVerification, pendingOtpToken, email }`
- `RegisterResponseDTO` (`DTO/Response/User/`) — `{ requiresEmailVerification, pendingOtpToken, email }`

## API Endpoints

### OtpController (`/api/otp`)

| Endpoint | Method | Route Name | Auth | Description |
|----------|--------|------------|------|-------------|
| `/api/otp/verify-login` | POST | `api_otp_verify_login` | Public | Verify OTP for login 2FA, returns User + sets cookie |
| `/api/otp/verify-email` | POST | `api_otp_verify_email` | Public | Verify OTP for email verification, sets verifiedAt + cookie |
| `/api/otp/resend` | POST | `api_otp_resend` | Public | Resend OTP, invalidates old one, returns new pendingOtpToken |

### Request/Response Examples

**Verify OTP** (`POST /api/otp/verify-login` or `/api/otp/verify-email`)
```json
// Request
{ "pendingOtpToken": "abc123...", "code": "123456" }

// Success → User JSON + HttpOnly cookie set
// Error 422 → { "message": "Code incorrect.", "remainingAttempts": 3 }
// Error 429 → { "message": "Nombre maximum de tentatives atteint..." }
// Error 401 → { "message": "Session invalide ou expirée." }
```

**Resend OTP** (`POST /api/otp/resend`)
```json
// Request
{ "pendingOtpToken": "old_token..." }

// Response
{ "pendingOtpToken": "new_token..." }
```

## Auth Flow Changes

### Login Flow (UserAuthenticator)
1. Email/password verified by Symfony security
2. Check `isVerified()`:
   - **Unverified**: Create OTP via `OtpService::createAndSend(user, OtpType::EmailVerification)` → return `{ requiresOtp: false, requiresEmailVerification: true, pendingOtpToken, email }` → frontend redirects to email verification OTP page
   - **Verified**: Create OTP via `OtpService::createAndSend(user, OtpType::Login)` → return `{ requiresOtp: true, requiresEmailVerification: false, pendingOtpToken }` → frontend redirects to login 2FA OTP page
3. User enters OTP on frontend → `POST /api/otp/verify-login` or `/verify-email` → cookie set

### Registration Flow (UserController)
1. Validate password, create user (verifiedAt = null)
2. Create OTP via `OtpService::createAndSend(user, OtpType::EmailVerification)`
3. Return `{ requiresEmailVerification: true, pendingOtpToken: "...", email: "..." }`
4. User enters OTP → `POST /api/otp/verify-email` → verifiedAt set + cookie set

### TokenAuthenticator Changes
- `EXCLUDED_ROUTES` constant lists all public route names (api_login, api_user_register, api_integrations_callback, api_stripe_webhook, api_otp_verify_login, api_otp_verify_email, api_otp_resend)
- `supports()` uses `in_array()` against `EXCLUDED_ROUTES` for clean, consistent route exclusion
- Defensive check: rejects users with `isVerified() === false`

## Migration

- Creates `otp` table
- Adds `verified_at` column to `user` table
- Sets `verified_at = NOW()` for all existing users (no disruption)
