# Onboarding Feature (Frontend)

## Overview

The onboarding system is a **unified full-page step flow** at `/onboarding` that covers the entire user journey: welcome presentation → registration → OTP verification → in-app setup (project, integrations, creator profile, AI script generation, subscriptions). The existing standalone login/register pages remain as fallbacks for returning users.

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
- **Authenticated** → post-auth steps (project + integrations + creator profile + script generation + subscriptions)

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
| 2 | `OnboardingCreatorProfileStep` | No (skippable) | Reuses `CreatorProfileForm` with `variant="onboarding"` (6 fields) |
| 3 | `OnboardingCreateScriptStep` | No (skippable) | Creates a script with title + platforms before generation |
| 4 | `OnboardingGenerateScriptStep` | No (skippable) | 3-phase step: brief form → AI generation animation → script preview. Uses script from step 3 if available. |
| 5 | `OnboardingSubscriptionStep` | No | Reuses `PlanSelector`, "Terminer" dismisses onboarding |

## Model & Enum

**File:** `app/models/Onboarding.ts`

Class with `fromJSON`, computed getters: `isCompleted`, `isDismissed`, `completionCount`, `totalSteps`, `isStepCompleted(step)`.

**File:** `app/models/enums/OnboardingStep.ts`

Values: `create_first_project`, `connect_integration`, `create_creator_profile`, `create_first_script`, `generate_first_script`, `show_subscriptions`

Step metadata defined as const maps: `onboardingStepToFrenchTranslation`, `onboardingStepToDescription`, `onboardingStepToIcon`, `onboardingStepToActionLabel`, `onboardingStepToNavigateTo`.

## React Query Hooks

**Directory:** `app/hooks/api/onboarding/`
- `onboardingQueryKeys.ts` — Query key factory
- `useShowOnboarding.ts` — `GET /api/onboarding` (supports `enabled` option)
- `useCompleteOnboardingStep.ts` — `POST /api/onboarding/complete-step`
- `useDismissOnboarding.ts` — `POST /api/onboarding/dismiss`

## Step Completion

All steps are completed by the frontend via `advanceStep` in `useOnboardingFlow`, which calls `POST /api/onboarding/complete-step`. Each step is marked complete when the user clicks "Suivant" or "Passer".

## Shared Components

### `OnboardingStepHeader`

**File:** `app/components/onboarding/OnboardingStepHeader.tsx`

Reusable header used by all onboarding step components. Renders the icon circle, title, and description.

Props: `icon` (React component), `title` (string), `description` (string or ReactNode).

### `PlatformPill`

**File:** `app/components/ui/PlatformPill.tsx`

Shared pill component for platform selection. Used by `CreatorProfileForm`, `ScriptPlatformsRow`, `CalendarFilterPanel`, and `OnboardingCreatorProfileStep`.

Props: `platform` (Platform), `isSelected` (boolean), `onToggle` (() => void).

### `CreatorProfileForm`

**File:** `app/components/scripts/creatorProfile/CreatorProfileForm.tsx`

Shared creator profile form supporting two variants:
- `'settings'` (default): full 8-field form with scrollable layout, change detection, sticky footer
- `'onboarding'`: 6-field form (platforms, content type, niche, target audience, tones, style sample), always-visible submit button

Props: `projectUuid`, `creatorProfile`, `onSuccess`, `variant?`.

### `ScriptBriefForm`

**File:** `app/components/scripts/generation/ScriptBriefForm.tsx`

Self-contained brief form that manages its own state internally. Accepts `initialValues` for pre-filling, `onSubmit` callback with validated `ScriptBriefValues`, optional `submitLabel`/`submitIcon` (renders submit button inside form), and optional `formId` (for external submit trigger). Reused in both `GenerateScriptPanel` (with `formId`) and `OnboardingGenerateScriptStep` (with `submitLabel`).

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

## OnboardingCreateScriptStep Detail

**File:** `app/components/onboarding/OnboardingCreateScriptStep.tsx`

Simple form component for creating a script before generation. Uses `OnboardingStepHeader` with `DocumentPlusIcon`. Contains:
- **Title** (required textarea)
- **Platforms** (optional, row of `PlatformPill` components)
- Submit button: "Créer le script" → calls `useCreateScript`, then `onScriptCreated(scriptUuid)`, then `onNext()`
- Skip button: "Passer" → calls `onNext()` without creating (generation step will create its own script as fallback)

Props: `projectUuid`, `onScriptCreated(scriptUuid)`, `onNext`.

## OnboardingGenerateScriptStep Detail

**File:** `app/components/onboarding/OnboardingGenerateScriptStep.tsx`

Thin orchestrator component that delegates logic to `useGenerateScriptFlow` hook and rendering to phase sub-components. Accepts an optional `scriptUuid` prop from the previous step (persisted via `useFocusScriptStore`).

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

- `app/stores/auth/authPrefillStore.ts`
- `app/routes/onboarding.tsx`
- `app/hooks/useOnboardingFlow.ts`
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
- `app/models/enums/OnboardingStep.ts`
- `app/hooks/api/onboarding/`
- `app/routes/protected.tsx`
