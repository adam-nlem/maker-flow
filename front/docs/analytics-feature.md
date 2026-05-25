# Analytics (PostHog)

## Overview

MakerFlow uses [PostHog](https://posthog.com) for product analytics. Events are tracked from the frontend via `posthog-js`.

## Setup

PostHog is initialized in `main.tsx` via `PostHogProvider` wrapping the app. Configuration uses three environment variables:
- `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` — PostHog project API key
- `VITE_PUBLIC_POSTHOG_API_HOST` — My managed reverse proxy domain (e.g., `https://t.maker-flow.com`)
- `VITE_PUBLIC_POSTHOG_UI_HOST` — Necessary because you're using a proxy, this way links will point back to PostHog properly (e.g., `https://eu.posthog.com`)

## Architecture

### Enum

**File:** `models/enums/AnalyticsEvent.ts`

Standard string-backed enum with PascalCase keys and snake_case values. All event names are defined here.

### Event Property Interfaces

**File:** `services/analytics/analyticsEventProperties.ts`

- `EventProperties` — base template interface (empty)
- One interface per event that has properties (e.g., `UserLoggedInEvent`, `ScriptGenerationCreatedEvent`), each extending `EventProperties`
- Events without properties use the base `EventProperties` directly in the type map

### Analytics Service

**File:** `services/analytics/analytics.ts`

Exports three functions:
- `track(event, properties?)` — type-safe wrapper around `posthog.capture()`. Uses `AnalyticsEventPropertiesMap` to enforce correct properties per `AnalyticsEvent` value.
- `identifyUser({ uuid, role })` — calls `posthog.identify()` to link events to a user, then `posthog.register({ user_role: role })` to attach the role as a super property to every subsequent event. If `role` is `null` (e.g., during legacy migrations), the super property is skipped.
- `resetUser()` — calls `posthog.reset()` to clear identity **and super properties** on logout

The service imports `posthog` directly from `posthog-js` (same singleton as the Provider), which allows usage in mutation hook callbacks (plain functions, not React components).

## Event Catalog

### Auth & Identity
| Event | Properties | Location |
|---|---|---|
| `UserRegistered` | — | `useRegister` |
| `UserLoggedIn` | `method: OtpType` | `useVerifyOtp` |
| *identify* | uuid, email | `useVerifyOtp` |
| *reset* | — | `useLogout` |

### Onboarding
| Event | Properties | Location |
|---|---|---|
| `OnboardingStepCompleted` | `step: OnboardingStep` | `useCompleteOnboardingStep` |
| `OnboardingDismissed` | — | `useDismissOnboarding` |

### Agency
| Event | Properties | Location |
|---|---|---|
| `AgencyCreated` | — | `useCreateAgency` |
| `AgencySettingsUpdated` | — | `useUpdateAgency` |

### Collaborators
| Event | Properties | Location |
|---|---|---|
| `CollaboratorInvited` | `role: UserRole` | `useInviteCollaborator` |
| `CollaboratorRemoved` | — | `useRemoveCollaborator` |

### Project Clients
| Event | Properties | Location |
|---|---|---|
| `ClientInvited` | `project_uuid: string` | `useInviteClient` |
| `ClientRemoved` | `project_uuid: string` | `useRemoveClient` |

### Invitations
| Event | Properties | Location |
|---|---|---|
| `InvitationDeleted` | — | `useDeleteInvitation` |
| `CollaboratorSetupCompleted` | — | `useCompleteInvitation` (fired when a non-client invitee finishes password setup) |
| `ClientSetupCompleted` | — | `useCompleteInvitation` (fired when a client invitee finishes password setup) |

### Projects
| Event | Properties | Location |
|---|---|---|
| `ProjectCreated` | `project_types: ProjectType[]` | `useCreateProject` |
| `ProjectDeleted` | — | `useDeleteProject` |

### Scripts
| Event | Properties | Location |
|---|---|---|
| `ScriptCreated` | — | `useCreateScript` |
| `ScriptDeleted` | — | `useDeleteScript` |
| `ScriptPartAdded` | `part_type: ScriptPartType` | All `useCreateScript{Part}` hooks |

### AI Script Generation
| Event | Properties | Location |
|---|---|---|
| `ScriptGenerationCreated` | `goal`, `opening_style`, `duration`, `ai_model`, `skills_count` | `useCreateScriptGeneration` |
| `ScriptGenerationRegenerated` | `ai_model: AiModel` | `useUpdateScriptGeneration` |

### Integrations
| Event | Properties | Location |
|---|---|---|
| `IntegrationConnected` | `platform: Platform` | `useCreateIntegration` |
| `IntegrationRevoked` | — | `useRevokeIntegration` |

### Subscription & Billing
| Event | Properties | Location |
|---|---|---|
| `SubscriptionCheckoutStarted` | `plan: SubscriptionPlan` | `useCreateSubscriptionCheckout` |
| `SubscriptionPurchased` | `plan: SubscriptionPlan` | `SubscriptionOverview` component |
| `SubscriptionCancelled` | — | `useCancelSubscription` |
| `SubscriptionResumed` | — | `useResumeSubscription` |
| `CreditRefillCheckoutStarted` | — | `useCreateRefillCheckout` |

### Other
| Event | Properties | Location |
|---|---|---|
| `CreatorProfileSaved` | — | `useCreateOrUpdateCreatorProfile` |
| `HookTemplateCreated` | — | `useCreateHookTemplate` |

## Adding a New Event

1. Add the event key to the `AnalyticsEvent` enum in `models/enums/AnalyticsEvent.ts`
2. If the event has properties, add a new interface extending `EventProperties` in `services/analytics/analyticsEventProperties.ts`
3. Add the mapping in `AnalyticsEventPropertiesMap` in `services/analytics/analytics.ts` (use `EventProperties` for events without properties, or the specific interface)
4. Call `track(AnalyticsEvent.YourEvent, { ...properties })` in the appropriate mutation hook `onSuccess` callback
5. Update this documentation

## Design Decisions

- **Direct `posthog-js` import** — all tracking is in mutation `onSuccess` callbacks (plain functions), not component bodies
- **AnalyticsEvent enum** — type-safe event names following the project's enum conventions
- **Event property interfaces** — all event interfaces in a single `analyticsEventProperties.ts` file, each extending the base `EventProperties` template
- **`user_role` super property** — set via `posthog.register({ user_role })` inside `identifyUser`. Auto-attached to every subsequent `capture()` call so PostHog dashboards can segment by `ROLE_ADMIN` / `ROLE_EDITOR` / `ROLE_VIEWER` / `ROLE_CLIENT` without touching individual `track()` calls or per-event interfaces. Cleared on logout by `posthog.reset()`. `useCompleteInvitation` calls `identifyUser` directly so an auto-authenticated invitee carries the right role from their very first event.
- **Script parts collapsed** — single `ScriptPartAdded` event with `part_type` discriminator instead of 8 separate events
- **No manual page views** — PostHog autocapture via `PostHogProvider` handles this
- **No script part update/delete tracking** — high-frequency editor micro-actions with low analytics value
- **Checkout funnel** — `SubscriptionCheckoutStarted` (before Stripe redirect) vs `SubscriptionPurchased` (after Stripe confirms) to measure drop-off
