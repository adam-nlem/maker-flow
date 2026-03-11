# Onboarding Feature (Frontend)

## Overview

The onboarding system is a **unified full-page step flow** at `/onboarding` that covers the entire user journey: welcome presentation → registration → OTP verification → in-app setup (project, integrations, script, subscriptions). The existing standalone login/register pages remain as fallbacks for returning users.

## Auth Prefill Store

**File:** `app/stores/auth/authPrefillStore.ts`

Persistent Zustand store (`app:auth:prefill`): `{ email: string | null, setEmail }`.

- Set on login/register form submit (both standalone pages and onboarding flow)
- Used by `protected.tsx` to decide redirect: no email → `/onboarding` (first-time), has email → `/login` (returning user)
- Used by login/register pages to prefill the email input

## Routing & Auth Guard

### Route

**Route:** `/onboarding` (public, handles both pre-auth and post-auth phases)

### Protected Layout (`routes/protected.tsx`)

Two redirect layers:
1. **Unauthenticated**: checks `authPrefillStore.email` → redirects to `/onboarding` (no email) or `/login` (has email)
2. **Onboarding guard**: fetches onboarding via `useShowOnboarding({ enabled: !!user })` → if not dismissed, redirects to `/onboarding`

## Unified Onboarding Page

**File:** `app/routes/onboarding.tsx`

Uses `useOnboardingFlow()` hook to manage all state and logic. Renders the appropriate phase based on auth state:
- **Not authenticated** → pre-auth steps (welcome + register + OTP)
- **Authenticated** → post-auth steps (project + integrations + script + subscriptions)

### `useOnboardingFlow` hook

**File:** `app/hooks/useOnboardingFlow.ts`

Encapsulates all onboarding page logic: auth detection, step state, redirect on dismissed, and transition handlers.

### Pre-Auth Steps

| Step | Component | Description |
|------|-----------|-------------|
| 0 | `WelcomeHeroStep` | Hero section with value proposition |
| 1 | `WelcomeFeatureStep` | Feature cards grid |
| 2 | `WelcomeHowItWorksStep` | 3-step visual guide |
| 3 | `OnboardingRegisterStep` | Embedded register form, "J'ai déjà un compte" link to `/login` |
| 4 | `OnboardingVerifyOtpStep` | 6-digit OTP verification, resend button |

After OTP verification, `useVerifyOtp` sets user in React Query cache → component detects auth → switches to post-auth steps.

### Post-Auth Steps

| Step | Component | Required | Description |
|------|-----------|----------|-------------|
| 0 | `OnboardingCreateProjectStep` | Yes | Reuses same form as `CreateProjectModal` |
| 1 | `OnboardingConnectIntegrationStep` | No (skippable) | Reuses `IntegrationSettingCard` components |
| 2 | `OnboardingCreateScriptStep` | No (skippable) | Title input + `useCreateScript` hook |
| 3 | `OnboardingSubscriptionStep` | No | Reuses `PlanSelector`, "Terminer" dismisses onboarding |

## Model & Enum

**File:** `app/models/Onboarding.ts`

Class with `fromJSON`, computed getters: `isCompleted`, `isDismissed`, `completionCount`, `totalSteps`, `isStepCompleted(step)`.

**File:** `app/models/enums/OnboardingStep.ts`

Values: `create_first_project`, `connect_integration`, `create_first_script`, `show_subscriptions`

Step metadata defined as const maps: `onboardingStepToFrenchTranslation`, `onboardingStepToDescription`, `onboardingStepToIcon`, `onboardingStepToActionLabel`, `onboardingStepToNavigateTo`.

## React Query Hooks

**Directory:** `app/hooks/api/onboarding/`
- `onboardingQueryKeys.ts` — Query key factory
- `useShowOnboarding.ts` — `GET /api/onboarding` (supports `enabled` option)
- `useCompleteOnboardingStep.ts` — `POST /api/onboarding/complete-step`
- `useDismissOnboarding.ts` — `POST /api/onboarding/dismiss`

## Step Completion

| Step | Detection |
|------|-----------|
| CreateFirstProject | Auto (backend, on project creation) |
| ConnectIntegration | Auto (backend, on integration OAuth) |
| CreateFirstScript | Auto (backend, on script creation) |
| ShowSubscriptions | Frontend (onboarding subscription step on mount) |

## Shared Components

### `OnboardingStepHeader`

**File:** `app/components/onboarding/OnboardingStepHeader.tsx`

Reusable header used by all 6 onboarding step components. Renders the icon circle, title, and description.

Props: `icon` (React component), `title` (string), `description` (string or ReactNode).

### `CreateProjectForm`

**File:** `app/components/projects/CreateProjectForm.tsx`

Shared project creation form used by both `CreateProjectModal` and `OnboardingCreateProjectStep`. Contains all form state, validation, fields (name, description, type pills), and submit logic.

Props: `onProjectCreated(projectUuid)`, `formSpacing?`, `buttonStyle?`.

### `RegisterForm`

**File:** `app/components/auth/RegisterForm.tsx`

Shared register form used by both `routes/register.tsx` and `OnboardingRegisterStep`. Contains all form state, validation, fields, and submit logic.

Props: `onRegistered({ pendingOtpToken, email })`, `initialEmail?`, `formSpacing?`.

### `VerifyOtpForm`

**File:** `app/components/auth/VerifyOtpForm.tsx`

Shared OTP verification form used by both `routes/verify-otp.tsx` and `OnboardingVerifyOtpStep`. Contains code input, cooldown timer, verify/resend logic.

Props: `pendingOtpToken`, `purpose`, `onVerified?`, `formSpacing?`.

### Welcome Components (reused in pre-auth steps)

**Directory:** `app/components/welcome/`
- `WelcomeHeroStep` — Hero section
- `WelcomeFeatureStep` — Feature cards
- `WelcomeHowItWorksStep` — How it works guide

## Shared Utilities

### `validateRegisterForm`

**File:** `app/utils/registerValidation.ts`

Shared validation logic used by `RegisterForm`. Returns the first error message or `null` if valid.

## Key Files

- `app/stores/auth/authPrefillStore.ts`
- `app/routes/onboarding.tsx`
- `app/hooks/useOnboardingFlow.ts`
- `app/components/onboarding/OnboardingStepHeader.tsx`
- `app/components/onboarding/OnboardingRegisterStep.tsx`
- `app/components/onboarding/OnboardingVerifyOtpStep.tsx`
- `app/components/onboarding/OnboardingCreateProjectStep.tsx`
- `app/components/onboarding/OnboardingConnectIntegrationStep.tsx`
- `app/components/onboarding/OnboardingCreateScriptStep.tsx`
- `app/components/onboarding/OnboardingSubscriptionStep.tsx`
- `app/components/projects/CreateProjectForm.tsx`
- `app/components/auth/RegisterForm.tsx`
- `app/components/auth/VerifyOtpForm.tsx`
- `app/utils/registerValidation.ts`
- `app/models/Onboarding.ts`
- `app/models/enums/OnboardingStep.ts`
- `app/hooks/api/onboarding/`
- `app/routes/protected.tsx`
