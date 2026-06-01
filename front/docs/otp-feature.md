# OTP Feature (Frontend)

## Overview

OTP verification UI for two security flows:
1. **2FA on login** — After email/password, user is redirected to OTP page to enter the 6-digit code sent to their email.
2. **Email verification on registration** — After account creation, user is redirected to OTP page to verify their email.

## Components

### Verify OTP Page (`routes/verify-otp.tsx`)

Shared page for both login 2FA and email verification. Receives state via React Router's `useLocation().state`.

**Route state:**
- `pendingOtpToken: string` — session identifier from backend
- `purpose: OtpType` — determines which endpoint to call
- `email: string` — displayed to user

**UI features:**
- Same `AuthStepLayout` card chrome as login/register (wordmark, eyebrow, heading, subtitle, trust footer, "Back to sign in" helper link)
- Purpose-specific title
- Pill chip at top of form: envelope icon + "Code sent to" + the user's email
- Six-digit numeric input rendered as 6 separate boxes via the shared `OtpDigitsInput` component:
  - Auto-advance on key entry
  - Backspace clears the current digit (or jumps left if empty)
  - ArrowLeft/ArrowRight navigate between boxes
  - Paste fills all 6 boxes at once
  - Autofocus first box on mount
  - Per-box state: `border-pale-gray-2` idle, `border-primary` + mint ring on focus, `border-danger` on error
- Error banner (same `bg-danger/10 text-danger` pattern)
- Submit button with arrow icon + loading state, disabled until 6 digits are entered
- Resend control: clock icon + `Resend in 0:NN` countdown while cooling down, otherwise an underlined "Resend code" link
- Redirects to `/login` if accessed directly without state

**Error handling:**
- Errors handled locally via try/catch (not global toasts)
- Displays backend error messages inline
- Clears code input on error

## Hooks

### `useVerifyOtp` (`hooks/api/users/useVerifyOtp.ts`)
- POST to `/otp/verify-login` or `/otp/verify-email` based on purpose
- On success: updates `userQueryKeys.me` in query cache with the returned User
- Returns `{ verifyOtp, isPending, error, reset }`

### `useResendOtp` (`hooks/api/users/useResendOtp.ts`)
- POST to `/otp/resend` with current `pendingOtpToken`
- Returns `ResendOtpResponseDTO` (old token is invalidated)
- Returns `{ resendOtp, isPending, error, reset }`

## Modified Hooks

### `useLogin` (changed return type)
- No longer returns `User` — returns `LoginResponseDTO` with `{ requiresOtp, pendingOtpToken }`
- Removed `onSuccess` that set query data (moved to `useVerifyOtp`)

### `useRegister` (changed return type)
- Returns `RegisterResponseDTO` with `{ requiresEmailVerification, pendingOtpToken, email }`

## Response DTOs (`models/dtos/`)

### `LoginResponseDTO` (`models/dtos/LoginResponseDTO.ts`)
- `requiresOtp: boolean`, `requiresEmailVerification: boolean`, `pendingOtpToken: string`, `email: string | null`
- Used by `useLogin` hook

### `RegisterResponseDTO` (`models/dtos/RegisterResponseDTO.ts`)
- `requiresEmailVerification: boolean`, `pendingOtpToken: string`, `email: string`
- Used by `useRegister` hook

### `ResendOtpResponseDTO` (`models/dtos/ResendOtpResponseDTO.ts`)
- `pendingOtpToken: string`
- Used by `useResendOtp` hook

## Modified Pages

### `login.tsx`
- `handleSubmit` navigates to `/verify-otp` with state after successful login
- Handles two cases: `requiresOtp` (login 2FA) and `requiresEmailVerification` (unverified email)
- Keeps the `useEffect` redirect for already-authenticated users visiting `/login`

### `register.tsx`
- Removed auto-login after registration (`useLogin` no longer imported)
- `handleSubmit` navigates to `/verify-otp` with state after successful registration

## Enums

### `OtpType` (`models/enums/OtpType.ts`)
- `Login = 'login'`, `EmailVerification = 'email_verification'`
- Mirrors backend `OtpType` enum
- Used in route state, `useVerifyOtp` hook, and verify-otp page
- `otpTypeToFrenchTranslation`: `Record<OtpType, string>` for page titles
- `otpTypeToEndpoint`: `Record<OtpType, string>` for verify API endpoints

## Model Changes

### `User` model (`models/User.ts`)
- Added `verifiedAt: Date | null` property
- Added `get isVerified(): boolean` computed property
- Updated `UserJSON` interface, `fromJSON`, and `toJSON`

## HTTP Client Changes

### `TooManyRequestsException` (`customHttpExceptions.ts`)
- New exception class for HTTP 429 responses

### Interceptor (`httpClient.ts`)
- Added `case 429` mapping to `TooManyRequestsException`

## Route Configuration

Added `route("verify-otp", "routes/verify-otp.tsx")` as a public route in `routes.ts`.
