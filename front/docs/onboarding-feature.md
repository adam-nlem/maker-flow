# Onboarding Feature (Frontend)

## Overview

The onboarding system is a **unified full-page step flow** at `/onboarding` that covers the entire user journey: welcome presentation → registration → OTP verification → in-app setup (project, integrations, creator profile, AI script generation, subscriptions). The existing standalone login/register pages remain as fallbacks for returning users.

## Architecture

All onboarding step components are **self-contained** (zero props). They read state from Zustand stores and hooks internally, and the route file uses `Record<Enum, ReactNode>` mappings instead of switch statements.

### Component Mapping Pattern

The route (`app/routes/onboarding.tsx`) maps enum values to components using Records:

```tsx
const welcomeNodes: Record<WelcomeStep, ReactNode> = {
    [WelcomeStep.Hero]: <WelcomeHeroStep />,
    [WelcomeStep.Features]: <WelcomeFeatureStep />,
    // ...
}

const postAuthNodes: Record<OnboardingStep, ReactNode> = {
    [OnboardingStep.CreateFirstProject]: <OnboardingCreateProjectStep />,
    // ...
}
```

This follows the same pattern as `settings.section.tsx`.

### State Management

- **`useOnboardingStore`** (`app/stores/onboarding/onboardingStore.ts`): Ephemeral Zustand store (no persist) for pre-auth navigation (`welcomeStep`) and OTP credentials (`pendingOtpToken`, `otpEmail`). Pre-auth components read/write this store for navigation.
- **`useFocusProjectStore`**: Post-auth components read `focusedProjectUuid` from this store.
- **`useFocusScriptStore`**: `OnboardingGenerateScriptStep` reads `focusedScriptUuid` from this store.
- **`useAdvanceOnboardingStep`** (`app/hooks/api/onboarding/useAdvanceOnboardingStep.ts`): Hook that encapsulates step completion logic. Post-auth components call `advanceStep()` internally.
- **`useOnboardingFlow`** (`app/hooks/useOnboardingFlow.ts`): Thin orchestrator hook used only by the route. Provides auth state, current step enum values, and progress dot data.

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

## Enums

### `WelcomeStep`

**File:** `app/models/enums/WelcomeStep.ts`

Values: `hero`, `features`, `how_it_works`, `register`, `verify_otp`. Exports `WELCOME_STEP_ORDER` array.

### `OnboardingStep`

**File:** `app/models/enums/OnboardingStep.ts`

Values: `create_first_project`, `connect_integration`, `create_creator_profile`, `create_first_script`, `generate_first_script`, `show_subscriptions`

Step metadata defined as const maps: `onboardingStepToFrenchTranslation`, `onboardingStepToDescription`, `onboardingStepToIcon`, `onboardingStepToActionLabel`, `onboardingStepToNavigateTo`.

## Pre-Auth Steps

| Step | Enum | Component | Description |
|------|------|-----------|-------------|
| 0 | `WelcomeStep.Hero` | `WelcomeHeroStep` | Hero section with value proposition |
| 1 | `WelcomeStep.Features` | `WelcomeFeatureStep` | Feature cards grid |
| 2 | `WelcomeStep.HowItWorks` | `WelcomeHowItWorksStep` | 3-step visual guide |
| 3 | `WelcomeStep.Register` | `OnboardingRegisterStep` | Embedded register form, "J'ai déjà un compte" link to `/login` |
| 4 | `WelcomeStep.VerifyOtp` | `OnboardingVerifyOtpStep` | 6-digit OTP verification, resend button |

All pre-auth components navigate via `useOnboardingStore.setWelcomeStep()`. Register step also calls `setOtpCredentials()` before navigating to OTP.

After OTP verification, `useVerifyOtp` sets user in React Query cache → component detects auth → switches to post-auth steps.

## Post-Auth Steps

| Step | Enum | Component | Required | Description |
|------|------|-----------|----------|-------------|
| 0 | `CreateFirstProject` | `OnboardingCreateProjectStep` | Yes | Reuses `CreateProjectForm`, sets `focusedProjectUuid` in store |
| 1 | `ConnectIntegration` | `OnboardingConnectIntegrationStep` | No (skippable) | Reuses `IntegrationSettingCard` components |
| 2 | `CreateCreatorProfile` | `OnboardingCreatorProfileStep` | No (skippable) | Reuses `CreatorProfileForm` with `variant="onboarding"` |
| 3 | `CreateFirstScript` | `OnboardingCreateScriptStep` | No (skippable) | Creates a script with title + platforms, sets `focusedScriptUuid` in store |
| 4 | `GenerateFirstScript` | `OnboardingGenerateScriptStep` | No (skippable) | 3-phase: brief form → AI generation → preview |
| 5 | `ShowSubscriptions` | `OnboardingSubscriptionStep` | No | Reuses `PlanSelector`, "Terminer" dismisses onboarding |

All post-auth components read `projectUuid` from `useFocusProjectStore` and advance via `useAdvanceOnboardingStep().advanceStep()`.

## Model

**File:** `app/models/Onboarding.ts`

Class with `fromJSON`, computed getters: `isCompleted`, `isDismissed`, `completionCount`, `totalSteps`, `isStepCompleted(step)`.

## React Query Hooks

**Directory:** `app/hooks/api/onboarding/`
- `onboardingQueryKeys.ts` — Query key factory
- `useShowOnboarding.ts` — `GET /api/onboarding` (supports `enabled` option)
- `useCompleteOnboardingStep.ts` — `POST /api/onboarding/complete-step`
- `useAdvanceOnboardingStep.ts` — Encapsulates advance logic (determines current step, calls `completeStep`)
- `useDismissOnboarding.ts` — `POST /api/onboarding/dismiss`

## Shared Components

### `OnboardingStepHeader`

**File:** `app/components/onboarding/OnboardingStepHeader.tsx`

Reusable header used by all onboarding step components. Renders the icon circle, title, and description.

Props: `icon` (React component), `title` (string), `description` (string or ReactNode).

### `PlatformPill`

**File:** `app/components/ui/PlatformPill.tsx`

Shared pill component for platform selection.

Props: `platform` (Platform), `isSelected` (boolean), `onToggle` (() => void).

### `CreatorProfileForm`

**File:** `app/components/scripts/creatorProfile/CreatorProfileForm.tsx`

Shared creator profile form supporting two variants:
- `'settings'` (default): full 8-field form with scrollable layout, change detection, sticky footer
- `'onboarding'`: 6-field form (platforms, content type, niche, target audience, tones, style sample), always-visible submit button

Props: `projectUuid`, `creatorProfile`, `onSuccess`, `variant?`.

### `ScriptBriefForm`

**File:** `app/components/scripts/generation/ScriptBriefForm.tsx`

Self-contained brief form that manages its own state internally. Accepts `initialValues` for pre-filling, `onSubmit` callback with validated `ScriptBriefValues`, optional `submitLabel`/`submitIcon` (renders submit button inside form), and optional `formId` (for external submit trigger).

### `CreateProjectForm`

**File:** `app/components/projects/CreateProjectForm.tsx`

Shared project creation form. Contains all form state, validation, fields (name, description, type pills), and submit logic.

Props: `onProjectCreated(projectUuid)`, `formSpacing?`, `buttonStyle?`.

### `RegisterForm`

**File:** `app/components/auth/RegisterForm.tsx`

Shared register form. Contains all form state, validation, fields, and submit logic.

Props: `onRegistered({ pendingOtpToken, email })`, `initialEmail?`, `formSpacing?`.

### `VerifyOtpForm`

**File:** `app/components/auth/VerifyOtpForm.tsx`

Shared OTP verification form. Contains code input, cooldown timer, verify/resend logic.

Props: `pendingOtpToken`, `purpose`, `onVerified?`, `formSpacing?`.

### Welcome Components

**Directory:** `app/components/welcome/`
- `WelcomeHeroStep` — Hero section
- `WelcomeFeatureStep` — Feature cards
- `WelcomeHowItWorksStep` — How it works guide

## OnboardingGenerateScriptStep Detail

### `useGenerateScriptFlow` hook

**File:** `app/hooks/useGenerateScriptFlow.ts`

Encapsulates all generation flow state and logic: phase transitions (`brief` → `generating` → `preview`), script/generation UUID management, rotating messages interval, recovery on reload (falls back to most recent script via `useListPaginatedScripts`), and the `handleBriefSubmit` handler (creates script if needed, triggers generation).

Returns: `{ phase, script, isPending, isFailed, messageIndex, handleBriefSubmit }`

### Phase Sub-Components

| Phase | Component | Layout | Description |
|-------|-----------|--------|-------------|
| brief | `OnboardingGenerateScriptStep` (inline) | Two-column | Left: `ScriptEditorPanel` (read-only), Right: `ScriptBriefForm` + skip button |
| generating | `GenerateScriptGeneratingPhase` | Two-column | Left: `ScriptEditorPanel`, Right: animated loading or error state |
| preview | `GenerateScriptPreviewPhase` | Centered | Success header + `ScriptEditorPanel` + continue button |

**Files:**
- `app/components/onboarding/GenerateScriptPreviewPhase.tsx`
- `app/components/onboarding/GenerateScriptGeneratingPhase.tsx`

## Key Files

- `app/routes/onboarding.tsx`
- `app/hooks/useOnboardingFlow.ts`
- `app/stores/onboarding/onboardingStore.ts`
- `app/stores/auth/authPrefillStore.ts`
- `app/models/enums/WelcomeStep.ts`
- `app/models/enums/OnboardingStep.ts`
- `app/hooks/api/onboarding/useAdvanceOnboardingStep.ts`
- `app/hooks/api/onboarding/useCompleteOnboardingStep.ts`
- `app/hooks/api/onboarding/useShowOnboarding.ts`
- `app/hooks/api/onboarding/useDismissOnboarding.ts`
- `app/components/onboarding/OnboardingStepHeader.tsx`
- `app/components/onboarding/OnboardingRegisterStep.tsx`
- `app/components/onboarding/OnboardingVerifyOtpStep.tsx`
- `app/components/onboarding/OnboardingCreateProjectStep.tsx`
- `app/components/onboarding/OnboardingConnectIntegrationStep.tsx`
- `app/components/onboarding/OnboardingCreatorProfileStep.tsx`
- `app/components/onboarding/OnboardingCreateScriptStep.tsx`
- `app/components/onboarding/OnboardingGenerateScriptStep.tsx`
- `app/components/onboarding/GenerateScriptPreviewPhase.tsx`
- `app/components/onboarding/GenerateScriptGeneratingPhase.tsx`
- `app/components/onboarding/OnboardingSubscriptionStep.tsx`
- `app/hooks/useGenerateScriptFlow.ts`
- `app/components/ui/PlatformPill.tsx`
- `app/components/scripts/creatorProfile/CreatorProfileForm.tsx`
- `app/components/scripts/generation/ScriptBriefForm.tsx`
- `app/components/projects/CreateProjectForm.tsx`
- `app/components/auth/RegisterForm.tsx`
- `app/components/auth/VerifyOtpForm.tsx`
- `app/utils/registerValidation.ts`
- `app/models/Onboarding.ts`
- `app/routes/protected.tsx`
