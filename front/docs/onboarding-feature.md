# Onboarding Feature (Frontend)

## Overview

The onboarding system is a **full-page step flow** at `/onboarding` covering two phases: welcome presentation (Features → HowItWorks) then post-auth setup (project, integrations, creator profile, AI script generation, subscriptions). After the welcome steps, users are redirected to the standalone `/register` route. The auth routes (`/login`, `/register`, `/verify-otp`) use `AuthStepLayout` for a consistent visual style.

## Architecture

All onboarding step components are **self-contained** (zero props). Auth pages (`/login`, `/register`, `/verify-otp`) are standalone routes using `AuthStepLayout`. The onboarding route file uses `Record<Enum, ReactNode>` mappings instead of switch statements.

### Component Mapping Pattern

The route (`app/routes/onboarding.tsx`) maps enum values to components using Records:

```tsx
const welcomeNodes: Record<WelcomeStep, ReactNode> = {
    [WelcomeStep.Features]: <WelcomeFeatureStep />,
    // ...
}

const onboardingNodes: Record<OnboardingStep, ReactNode> = {
    [OnboardingStep.CreateFirstProject]: <OnboardingCreateProjectStep />,
    // ...
}
```

This follows the same pattern as `settings.section.tsx`.

### State Management

- **`useOnboardingStore`** (`app/stores/onboarding/onboardingStore.ts`): Ephemeral Zustand store (no persist) for welcome step navigation (`welcomeStep`, `setWelcomeStep`). Only used by the welcome step components (Features, HowItWorks).
- **`useFocusProjectStore`**: Post-auth components read `focusedProjectUuid` from this store.
- **`useFocusScriptStore`**: `OnboardingGenerateScriptStep` reads `focusedScriptUuid` from this store.
- **`useAdvanceOnboardingStep`** (`app/hooks/api/onboarding/useAdvanceOnboardingStep.ts`): Hook that encapsulates step completion logic. Post-auth components call `advanceStep()` internally.
- **`useOnboardingFlow`** (`app/hooks/useOnboardingFlow.ts`): Thin orchestrator hook used only by the route. Provides auth state, current step enum values, and progress dot data.

## Auth Prefill Store

**File:** `app/stores/auth/authPrefillStore.ts`

Persistent Zustand store (`app:auth:prefill`): `{ email: string | null, setEmail }`. Resettable (cleared on logout).

- Set on login/register form submit (both standalone pages and onboarding flow)
- Used by login/register pages to prefill the email input

## Routing & Auth Guard

### Route

**Route:** `/onboarding` (public, handles both pre-auth and post-auth phases)

### Protected Layout (`routes/protected.tsx`)

Single effect with two redirect layers:
1. **Unauthenticated**: redirects to `/onboarding` (first-time, no stored email) or `/login` (returning user, has stored email via `authPrefillStore`).
2. **Onboarding guard**: fetches onboarding via `useShowOnboarding({ enabled: !!user })` → if not dismissed, redirects to `/onboarding`

## Enums

### `WelcomeStep`

**File:** `app/models/enums/WelcomeStep.ts`

Values: `features`, `how_it_works`. Exports `WELCOME_STEP_ORDER` array and metadata maps (`welcomeStepToIcon`, `welcomeStepToShortLabel`). Auth steps (login, register, verify OTP) are handled by standalone routes, not welcome steps.

### `OnboardingStep`

**File:** `app/models/enums/OnboardingStep.ts`

Values: `create_agency`, `create_first_project`, `connect_integration`, `create_creator_profile`, `create_first_script`, `generate_first_script`, `show_subscriptions`

Step metadata defined as const maps: `onboardingStepToFrenchTranslation`, `onboardingStepToDescription`, `onboardingStepToIcon`, `onboardingStepToActionLabel`, `onboardingStepToNavigateTo`.

## Pre-Auth Steps

| Step | Enum | Component | Description |
|------|------|-----------|-------------|
| 0 | `WelcomeStep.Features` | `WelcomeFeatureStep` | Feature cards grid |
| 1 | `WelcomeStep.HowItWorks` | `WelcomeHowItWorksStep` | 3-step visual guide, "Next" navigates to `/register` |

After HowItWorks, the user is redirected to `/register` (standalone route). After registration → `/verify-otp` → `/` → `protected.tsx` redirects to `/onboarding` for post-auth steps.

## Post-Auth Steps

| Step | Enum | Component | Required | Description |
|------|------|-----------|----------|-------------|
| 0 | `CreateAgency` | `OnboardingCreateAgencyStep` | Yes | Submits `POST /api/agencies` (name + optional brand color, contact email, website). Auto-advances on mount when `user.agency !== null` or `user.role === ROLE_CLIENT`, so existing agencies / clients skip it. Form validation lives in `app/utils/agencyValidation.ts` (mirrors `registerValidation.ts`). |
| 1 | `CreateFirstProject` | `OnboardingCreateProjectStep` | Yes | Reuses `CreateProjectForm`, sets `focusedProjectUuid` in store |
| 2 | `ConnectIntegration` | `OnboardingConnectIntegrationStep` | No (skippable) | Reuses `IntegrationSettingCard` components |
| 3 | `CreateCreatorProfile` | `OnboardingCreatorProfileStep` | No (skippable) | Reuses `CreatorProfileForm` with `variant="onboarding"` |
| 4 | `CreateFirstScript` | `OnboardingCreateScriptStep` | No (skippable) | Creates a script with title + platforms, sets `focusedScriptUuid` in store |
| 5 | `GenerateFirstScript` | `OnboardingGenerateScriptStep` | No (skippable) | 3-phase: brief form → AI generation → preview |
| 6 | `ShowSubscriptions` | `OnboardingSubscriptionStep` | No | Uses shared `SubscriptionOverview` with `successUrl="/onboarding?checkout=success"` and a custom `subscribedView` (success confirmation with CheckCircleIcon + plan name). |

`AgencyShellLayout` redirects users with `user.agency === null && !user.isClient` to `/onboarding` so the agency shell never renders against a null agency.

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

### `OnboardingStepLayout`

**File:** `app/components/onboarding/OnboardingStepLayout.tsx`

Shared layout component used by all onboarding step components. Provides consistent structure: full-screen centered layout with `OnboardingStepHeader` and content area.

Props: `maxWidth?` (string, defaults to `"max-w-lg"`), `disableNextButton?` (boolean), `fullHeight?` (boolean, uses `h-screen` with top padding instead of `min-h-screen` centered), `padding?` (string, defaults to `"px-6"`), `children` (ReactNode).

### `OnboardingStepHeader`

**File:** `app/components/onboarding/OnboardingStepHeader.tsx`

Self-contained header used by `OnboardingStepLayout`. Reads the current step from `useOnboardingFlow` and looks up title/description from enum metadata (`onboardingStepToFrenchTranslation`, `onboardingStepToDescription`). Also renders the progress bar and "Continuer" button.

Props: `disableNextButton?` (optional, used by `OnboardingCreateScriptStep`).

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

### AuthStepLayout

**File:** `app/components/auth/AuthStepLayout.tsx`

Shared layout component used by all auth step components and welcome steps. Provides consistent structure: full-screen centered layout, optional icon badge, title, subtitle, content wrapper, and standardized button footer.

Props: `icon?` (HeroIcon), `title` (string), `subtitle` (ReactNode), `onBack?` (() => void), `onNext?` (() => void), `nextLabel?` (string, defaults to "Suivant"), `children?` (ReactNode).

### Auth Form Components

**Directory:** `app/components/auth/`
- `LoginForm` — Login form (email + password). Props: `onLoginSuccess()`, `onOtpRequired(data)`, `initialEmail?`

Auth pages (`/login`, `/register`, `/verify-otp`) are standalone route pages that compose `AuthStepLayout` with the appropriate form component (`LoginForm`, `RegisterForm`, `VerifyOtpForm`).

### Welcome Components

**Directory:** `app/components/welcome/`
- `WelcomeFeatureStep` — Feature cards (uses `AuthStepLayout`)
- `WelcomeHowItWorksStep` — How it works guide (uses `AuthStepLayout`)

## OnboardingGenerateScriptStep Detail

### `useGenerateScriptFlow` hook

**File:** `app/hooks/useGenerateScriptFlow.ts`

Encapsulates all generation flow state and logic: phase transitions (`brief` → `generating` → `preview`), script/generation UUID management, rotating messages interval, recovery on reload (falls back to most recent script via `useListPaginatedScripts`, and resumes from existing generations via `useLatestScriptGeneration` — in-progress → Generating phase, completed → Preview phase), and the `handleBriefSubmit` handler (creates script if needed, triggers generation).

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
- `app/components/auth/AuthStepLayout.tsx`
- `app/components/auth/LoginForm.tsx`
- `app/components/onboarding/OnboardingCreateAgencyStep.tsx`
- `app/utils/agencyValidation.ts`
- `app/hooks/api/agency/useCreateAgency.ts`
- `app/hooks/api/agency/agencyQueryKeys.ts`
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
