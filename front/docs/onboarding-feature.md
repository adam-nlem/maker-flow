# Onboarding Feature (Frontend)

## Overview

The onboarding system is a **role-aware full-page wizard** at `/onboarding`. It is **strictly post-authentication** — a step list chosen at runtime from one of three enums based on `user.displayRole`. There is no in-app pre-login landing page; unauthenticated visitors are sent straight to `/login` (and from there to `/register` if they need an account).

After registration → `/verify-otp` → `/` → `RootRedirect` dispatches the authenticated user → `protected.tsx` detects `!onboarding.isDismissed` and redirects to `/onboarding`. When dismissed, `useOnboardingFlow` redirects agency members to `/agency` and clients to `/client`. If an unauthenticated visitor hits `/onboarding` directly, `OnboardingPage` redirects them to `/`, which `RootRedirect` then forwards to `/login`.

## Role-aware step lists

The active step order is resolved by [`getOnboardingFlowConfig(role)`](../src/models/enums/onboardingFlow.ts):

### Admin — `AgencyAdminOnboardingStep` (5 steps)
| Order | Value | Component | Notes |
|-------|-------|-----------|-------|
| 0 | `create_agency` | `OnboardingCreateAgencyStep` | Auto-advances when `user.agency !== null`. Collects agency **name** + required **logo**; submits a single multipart `POST /api/agencies` via `useCreateAgency`. The right panel mocks the app sidebar and live-previews the agency identity (an inline `AgencyLogo` + name tile fed the typed name + a local object-URL of the picked logo) at the bottom, showing a `Shimmer` until either field is filled. Once filled, the full identity card (`IdentityPopoverView`, static/non-functional) also renders to the right of the sidebar by the tile. |
| 1 | `create_first_project` | `OnboardingCreateProjectStep` | Sets `focusedProjectUuid`. |
| 2 | `invite_first_client` | `OnboardingInviteFirstClientStep` | Reuses `InviteClientForm` for the focused project. Skippable. |
| 3 | `connect_first_integration` | `OnboardingConnectIntegrationStep` | OAuth tiles for the focused project. Skippable. |
| 4 | `show_subscriptions` | `OnboardingSubscriptionStep` | `SubscriptionOverview` checkout. |

Collaborator invitation is **not** part of onboarding — seat count depends on the subscription tier picked at the last step. Collaborator invites live exclusively in the Collaborators block of `/agency/settings/agency`.

### Collaborator (Editor / Viewer) — `AgencyCollaboratorOnboardingStep` (2 steps)
| Order | Value | Component |
|-------|-------|-----------|
| 0 | `explore_projects` | `OnboardingExploreProjectsStep` — info screen with "Take me there" → `/agency`. |
| 1 | `explore_contents` | `OnboardingExploreContentsStep` — info screen with "Take me there" → `/agency/contents`. |

### Client — `ClientOnboardingStep` (2 steps)
| Order | Value | Component |
|-------|-------|-----------|
| 0 | `connect_first_integration` | `OnboardingConnectIntegrationStep` — reads `focusedProjectUuid` from the shared focus project store (seeded by `useSyncFocusedProject` in `protected.tsx`, which calls `GET /api/projects` — that returns the client's single project for `ROLE_CLIENT`). |
| 1 | `explore_contents` | `OnboardingExploreContentsStep` — navigates to `/client/contents`. |

## Architecture

### Flow config

[`src/models/enums/onboardingFlow.ts`](../src/models/enums/onboardingFlow.ts) exposes `getOnboardingFlowConfig(role)`, returning `{ order, translationKeys, descriptionKeys, shortLabelKeys, icons, navigateTo }` for the active role. Components read this single config; they never branch on role themselves.

### Per-role enum files

Each enum file exports:
- the enum + an ORDER array
- five metadata maps (translation, description, shortLabel, icon, navigateTo)

Files:
- [`AgencyAdminOnboardingStep.ts`](../src/models/enums/AgencyAdminOnboardingStep.ts)
- [`AgencyCollaboratorOnboardingStep.ts`](../src/models/enums/AgencyCollaboratorOnboardingStep.ts)
- [`ClientOnboardingStep.ts`](../src/models/enums/ClientOnboardingStep.ts)

### Route + node mapping

`src/routes/onboarding.tsx` keeps one `Record<Enum, ReactNode>` per role and resolves the right node via `resolveStepNode(role, stepValue)`. Shared step values (e.g., `connect_first_integration`, `explore_contents`) are mapped per-role so the component receives the correct flavor.

### Hooks

- [`useOnboardingFlow`](../src/hooks/useOnboardingFlow.ts) — orchestrator. Selects the flow config from `user.displayRole`, computes `currentOnboardingStep`, redirects on dismiss (`/agency` or `/client`). Authenticated-only; the hook no longer carries any pre-auth state.
- [`useAdvanceOnboardingStep`](../src/hooks/api/onboarding/useAdvanceOnboardingStep.ts) — completes the current step and dismisses on the last one. Drives every step component.
- `useShowOnboarding` / `useCompleteOnboardingStep` / `useDismissOnboarding` — React Query wrappers for the three endpoints. `useCompleteOnboardingStep` accepts a raw `string` step value; the backend validates applicability and returns `InvalidOnboardingStepException` (code 32001) for cross-role attempts.

### Model

`src/models/Onboarding.ts` — `isStepCompleted(step: string)`. Enum-agnostic so any role's step values work.

## i18n

Translation keys are namespaced per role under `enums:onboardingStep.{admin|collaborator|client}.{titles|descriptions|shortLabels}.<stepCamelCase>`. Explore step copy lives under `onboarding:exploreProjects.*` and `onboarding:exploreContents.*`.

## Shared chrome

- `OnboardingProgressBar` reads from `useOnboardingFlow().flowConfig` so adding a step in any role file flows through automatically.
- `OnboardingStepLayout` exposes two content slots:
  - `left: ReactNode` (required) — the step's primary content. The progress bar, title and description always render above it in the left column.
  - `right?: ReactNode` (optional) — supporting content (illustration, preview, secondary panel). When provided, the screen splits 50/50 (left column + right column); when omitted, the left column stays centered as before.
  - `maxWidth?: string` (default `max-w-lg`) — constrains the `left` content container.

## Key Files

- `src/routes/onboarding.tsx`
- `src/hooks/useOnboardingFlow.ts`
- `src/hooks/api/onboarding/useAdvanceOnboardingStep.ts`
- `src/hooks/api/onboarding/useCompleteOnboardingStep.ts`
- `src/hooks/api/onboarding/useShowOnboarding.ts`
- `src/hooks/api/onboarding/useDismissOnboarding.ts`
- `src/models/enums/onboardingFlow.ts`
- `src/models/enums/AgencyAdminOnboardingStep.ts`
- `src/models/enums/AgencyCollaboratorOnboardingStep.ts`
- `src/models/enums/ClientOnboardingStep.ts`
- `src/models/Onboarding.ts`
- `src/components/onboarding/OnboardingStepLayout.tsx`
- `src/components/onboarding/OnboardingStepHeader.tsx`
- `src/components/onboarding/OnboardingProgressBar.tsx`
- `src/components/onboarding/OnboardingCreateAgencyStep.tsx`
- `src/components/onboarding/OnboardingCreateProjectStep.tsx`
- `src/components/onboarding/OnboardingInviteFirstClientStep.tsx`
- `src/components/onboarding/OnboardingConnectIntegrationStep.tsx`
- `src/components/onboarding/OnboardingExploreProjectsStep.tsx`
- `src/components/onboarding/OnboardingExploreContentsStep.tsx`
- `src/components/onboarding/OnboardingSubscriptionStep.tsx`
- `src/components/settings/project/InviteClientForm.tsx` (reused)
