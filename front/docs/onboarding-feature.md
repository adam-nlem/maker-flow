# Onboarding Feature (Frontend)

## Overview

The onboarding system is a **role-aware full-page wizard** at `/onboarding`. It is **strictly post-authentication** — a single unified enum + config map drives the wizard, filtered by `user.displayRole` at runtime. There is no in-app pre-login landing page; unauthenticated visitors are sent to `/login`.

After registration → `/verify-otp` → `/` → `RootRedirect` dispatches the authenticated user → `protected.tsx` detects `!onboarding.isDismissed` and redirects to `/onboarding`. When dismissed, `useOnboardingFlow` redirects agency members to `/agency` and clients to `/client`.

Editor and Viewer roles have **no onboarding steps**; their `Onboarding` row is auto-dismissed at creation server-side so they land directly on `/agency`.

## Role-aware step flows

The active step list is resolved by `getOrderedStepsForRole(role)` from [`OnboardingStep.tsx`](../src/models/enums/OnboardingStep.tsx). Filtering is driven by each step's `applicableRoles` declared in `ONBOARDING_STEP_CONFIG`.

### Admin (5 steps)
| Order | Value | Component | Notes |
|-------|-------|-----------|-------|
| 0 | `create_agency` | `OnboardingCreateAgencyStep` | Auto-advances when `user.agency !== null`. Collects agency name + required logo; submits multipart `POST /api/agencies`. |
| 1 | `create_first_project` | `OnboardingCreateProjectStep` | Sets `focusedProjectUuid` after creation. |
| 2 | `invite_first_client` | `OnboardingInviteFirstClientStep` | Reuses `InviteClientForm`; skippable. |
| 3 | `connect_first_integration` | `OnboardingConnectIntegrationStep` | OAuth tiles for the focused project; skippable. |
| 4 | `show_subscriptions` | `OnboardingSubscriptionStep` | `SubscriptionOverview` checkout. |

### Client (2 steps)
| Order | Value | Component |
|-------|-------|-----------|
| 0 | `connect_first_integration` | `OnboardingConnectIntegrationStep` — reads `focusedProjectUuid` from the shared focus project store (seeded by `useSyncFocusedProject` in `protected.tsx`). |
| 1 | `explore_contents` | `OnboardingExploreContentsStep` — navigates to `/client/contents`. |

### Editor / Viewer
No steps — onboarding is auto-dismissed server-side on first GET. User lands directly on `/agency`.

## Architecture

### Single source of truth

[`src/models/enums/OnboardingStep.tsx`](../src/models/enums/OnboardingStep.tsx) exposes:

- `enum OnboardingStep` (6 string-backed cases shared with the backend enum)
- `interface OnboardingStepConfig { titleKey, descriptionKey, icon, component, applicableRoles }`
- `const ONBOARDING_STEP_CONFIG: Record<OnboardingStep, OnboardingStepConfig>` — every step's metadata + JSX component + the roles allowed to see it
- `getOrderedStepsForRole(role)` — returns the steps in enum declaration order, filtered by `applicableRoles`

Adding a step = adding one entry to `ONBOARDING_STEP_CONFIG`. There is no per-role enum, no separate metadata map, no per-role component dispatch table.

### Hooks

- [`useOnboardingFlow`](../src/hooks/useOnboardingFlow.ts) — orchestrator. Computes `order`, `currentOnboardingStep`, `currentStepConfig`, `currentStep` index. Redirects on dismiss (`/agency` or `/client` based on `user.isClient`).
- [`useAdvanceOnboardingStep`](../src/hooks/api/onboarding/useAdvanceOnboardingStep.ts) — calls `completeStep(currentOnboardingStep)`. Backend auto-dismisses when every applicable step is done; the explicit dismiss branch was removed.
- `useShowOnboarding` / `useCompleteOnboardingStep` — React Query wrappers.
- `useDismissOnboarding` — present but unused; reserved for a future "skip-all" CTA.

### Model

`src/models/Onboarding.ts` — `isStepCompleted(step: string)`. Enum-agnostic.

## i18n

A single flat namespace per locale:

```
enums:onboardingStep.titles.<stepCamelCase>
enums:onboardingStep.descriptions.<stepCamelCase>
```

The shared `connect_first_integration` step uses one copy (currently the admin wording). Body copy for the explore step still lives at `onboarding:exploreContents.*`.

## Shared chrome

- `OnboardingProgressBar` reads `currentStep` + `totalSteps` from `useOnboardingFlow`. Adding a step in the config propagates automatically. Renders numbered badges: past steps `bg-pale-gray-2`, current `bg-primary`, future `bg-dark`.
- `OnboardingStepLayout` exposes two content slots:
  - `left: ReactNode` (required) — the step's primary content. Progress bar, title and description always render above it.
  - `right?: ReactNode` (optional) — supporting content. When provided the screen splits 50/50; when omitted the left column stays centered.
  - Title and description come from `currentStepConfig.titleKey` / `descriptionKey`.

## Routing entry point

`src/routes/onboarding.tsx` reads `currentStepConfig` from `useOnboardingFlow` and renders `currentStepConfig.component`. No per-role dispatch — the config map already encodes which step is rendered.

## Per-step staging stores

Each data-bearing step owns a dedicated `createResettableStore`-wrapped, persisted Zustand store under `src/stores/onboarding/`. A store holds two kinds of state:

1. **Staging fields** — the in-progress form values so the live preview can mirror them as the user types.
2. **The created entity object** (`null` until the step's API call succeeds, then set on submit).

**Object-first preview rule.** Previews (and the shared `OnboardingPreviewLayout` sidebar) prefer the created object when present, falling back to the staging fields otherwise. This fixes stale previews after a step completes: the staging logo is a `blob:` object URL that gets revoked, leaving a broken image. When the created object exists, the preview reads the **real** `name` and switches the logo component to **uncontrolled** mode — passing the entity `uuid` (and omitting `logoUrl`) so `AgencyLogo` / `ProjectLogo` fetch the persisted server logo via `useShowAgencyLogo` / `useShowProjectLogo`.

**Persist primitives only.** Each store persists only its plain-primitive staging fields via `partialize`. Blob preview URLs (invalid after a reload) and the created class instances (would lose their prototype through JSON) are excluded.

| Store (`use…`) | Persist key | State | `partialize` |
|----------------|-------------|-------|--------------|
| `useOnboardingCreateAgencyStore` | `app:onboarding:create-agency` | `agencyName`, `agencyLogoPreviewUrl`, `agency: Agency \| null` | `{ agencyName }` |
| `useOnboardingCreateProjectStore` | `app:onboarding:create-project` | `projectName`, `projectLogoPreviewUrl`, `projectTypes`, `project: Project \| null` | `{ projectName, projectTypes }` |
| `useOnboardingInviteFirstClientStore` | `app:onboarding:invite-first-client` | `firstName`, `lastName`, `email`, `invitation: Invitation \| null` | `{ firstName, lastName, email }` |

Each setter writes exactly one field — no cross-field side effects. All stores are `createResettableStore`-wrapped so `resetAllStores()` (logout / 401) clears form state.

The created object is set inside each step's submit handler: `OnboardingCreateAgencyStep` calls `setAgency(agency)`, `OnboardingCreateProjectStep` calls `setProject(project)` (alongside `setFocusedProjectUuid`), and `OnboardingInviteFirstClientStep` calls `setInvitation(invitation)`.

### Shared `InviteClientForm`

`InviteClientForm` (`components/agency/settings/project/InviteClientForm.tsx`) is reused by both the agency settings page and the onboarding step, so it stays self-contained (its own `useState`). Two **optional** props let the onboarding context observe it without coupling the settings usage to any store:

- `onValuesChange?: (v: { firstName, lastName, email }) => void` — fired on every field change; the onboarding step pipes it into `useOnboardingInviteFirstClientStore` so the preview mirrors typed values.
- `onInvited: (invitation: Invitation) => void` — widened to receive the created `Invitation` (settings callers simply ignore the argument).

## WIP — not wired

`OnboardingLivePreview.tsx` is a draft preview component (sidebar mock + identity tile). It still has unresolved bindings (`hasIdentity`, `logoPreviewUrl`, `name`, `user`, `AgencyLogo`, `IdentityPopoverView`, `Shimmer`) and is **not imported anywhere**. Finish wiring before consuming.

## Key Files

- `src/routes/onboarding.tsx`
- `src/hooks/useOnboardingFlow.ts`
- `src/hooks/api/onboarding/useAdvanceOnboardingStep.ts`
- `src/hooks/api/onboarding/useCompleteOnboardingStep.ts`
- `src/hooks/api/onboarding/useShowOnboarding.ts`
- `src/hooks/api/onboarding/useDismissOnboarding.ts` (dormant)
- `src/models/enums/OnboardingStep.tsx`
- `src/models/Onboarding.ts`
- `src/components/onboarding/OnboardingStepLayout.tsx`
- `src/components/onboarding/OnboardingProgressBar.tsx`
- `src/components/onboarding/OnboardingStepHeader.tsx`
- `src/components/onboarding/OnboardingCreateAgencyStep.tsx`
- `src/components/onboarding/OnboardingCreateProjectStep.tsx`
- `src/components/onboarding/OnboardingInviteFirstClientStep.tsx`
- `src/components/onboarding/OnboardingConnectIntegrationStep.tsx`
- `src/components/onboarding/OnboardingExploreContentsStep.tsx`
- `src/components/onboarding/OnboardingSubscriptionStep.tsx`
- `src/components/onboarding/OnboardingPreviewLayout.tsx`
- `src/components/onboarding/previews/OnboardingCreateAgencyPreview.tsx`
- `src/components/onboarding/previews/OnboardingCreateProjectPreview.tsx`
- `src/components/onboarding/previews/OnboardingInviteFirstClientPreview.tsx`
- `src/stores/onboarding/onboardingCreateAgencyStore.ts`
- `src/stores/onboarding/onboardingCreateProjectStore.ts`
- `src/stores/onboarding/onboardingInviteFirstClientStore.ts`
- `src/components/agency/settings/project/InviteClientForm.tsx` (reused; optional `onValuesChange`)
