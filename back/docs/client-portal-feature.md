# Client Portal (Backend)

## Overview

The Client Portal is the read-only experience served to `ROLE_CLIENT` users — the brand-owner accounts that an agency invites to a specific Project. The backend does **not** maintain a parallel set of endpoints for clients: the same project / integration / insights endpoints back both shells, with access scoped by `ProjectVoter` and (for billing) `AgencyVoter`. Role-aware behaviour is encapsulated in the voters and a handful of repository methods.

This document gathers everything the backend does specifically to serve clients. For neighbouring concerns:
- `back/docs/agency-feature.md` — the role hierarchy, voter catalog, agency entity, and the user identity payload.
- `back/docs/invitation-feature.md` — how clients get into the system (polymorphic Invitation + setup link).
- `back/docs/project-feature.md` — the role-aware project repository methods.
- `back/docs/billing-feature.md` — the agency-scoped subscription that gates the portal.
- `back/docs/onboarding-feature.md` — the `ClientOnboardingStep` flow that runs on first login.

## Client identity

| Field | Value for a client | Notes |
|-------|--------------------|-------|
| `User.roles` | `["ROLE_USER", "ROLE_CLIENT"]` | Stored as JSON; baseline `ROLE_USER` always present. Tier-checks go through `User::hasRole(UserRole::Client)` or `$user->getDisplayRole()`. |
| `User.agency` | `null` | Clients are never collaborators of an agency — they are tenants of a specific project. |
| `User.project` | the project they were invited to | Set by `InvitationService::completeSetup`. `SET NULL` on project deletion (the user survives, but loses portal access). |

### `GET /api/users/me` payload

Already documented in `back/docs/agency-feature.md`. For clients specifically, the identity response carries:
- `roles: ["ROLE_USER", "ROLE_CLIENT"]`
- `agency: null`
- `clientProjectUuid` — the UUID of `User.project` (used by the frontend to fetch the project and its branding).

The frontend resolves the agency identity for the client shell through `GET /api/projects/{clientProjectUuid}` (group `api_project_get_by_uuid`), which nests `agency: { uuid, name, contactEmail, website }`. No dedicated `/api/agencies/current` is exposed to clients — they read agency metadata through the project endpoint instead.

## Endpoints reachable from the client portal

The portal calls the **same** REST endpoints as the agency shell. Access is gated by `ProjectVoter` (project-scoped resources) and `AgencyVoter` (agency-level resources). Behaviour summary per endpoint:

| Endpoint | Voter attribute | Behaviour for `ROLE_CLIENT` |
|----------|-----------------|-----------------------------|
| `GET /api/projects` | role-aware repository | Returns a 1-row paginated list containing the client's own `User.project` on page 1, empty array on subsequent pages (see `ProjectRepository::getAccessibleByUserPaginated`). |
| `GET /api/projects/{uuid}` | `ProjectVoter::VIEW` (allowed on `clientUsers` membership) | Returns the project nested with `agency` for branding. Throws `AgencySubscriptionInactiveException` when the parent agency has no active subscription — see below. |
| `GET /api/integrations`, `GET /api/integrations/{uuid}`, `GET /api/integration-insights*`, `GET /api/posts*` | `ProjectVoter::VIEW` on the project that owns the resource | Same payload agency members see; read-only. |
| `GET /api/reviews`, `GET /api/reviews/{uuid}`, `GET /api/review-versions/files`, `GET /api/review-versions/stream` | `ProjectVoter::VIEW` | Read-only. Clients see only the drafts of their own project. |
| `POST /api/review-versions/{reviewVersionUuid}/approve` | `ProjectVoter::VIEW` + `IsGranted(ROLE_CLIENT)` | **Client-only** approve action (agency Admin/Editor are explicitly excluded from self-approval). When the client wants revisions instead, they post on the comment thread — no dedicated status transition. See `back/docs/review-feature.md` for the per-version status state machine and the comment thread model. |
| `POST /api/review-versions/{reviewVersionUuid}/comments` | `ProjectVoter::VIEW` | Open to both agency members and clients — the per-version comment thread is bidirectional. Comment only, no status change. |
| `POST /api/integrations` (initiate OAuth) | `ProjectVoter::MANAGE_INTEGRATIONS` | Allowed for clients on their own project. The resulting `Integration.createdBy` is the client user; agency members of the project's agency see the new integration in their own list. See `back/docs/integration-oauth-feature.md`. |
| `DELETE /api/integrations/{uuid}` | `ProjectVoter::MANAGE_INTEGRATIONS` | Allowed: same logic as above. |
| `POST /api/projects`, `PATCH /api/projects/{uuid}`, `DELETE /api/projects/{uuid}`, project lifecycle endpoints | `ProjectVoter::EDIT` (`ROLE_EDITOR+`) | **Forbidden** for clients (403). |
| `POST /api/projects/{uuid}/clients`, `DELETE …` | `ProjectVoter::MANAGE_CLIENT` (`ROLE_EDITOR+`) | **Forbidden** for clients. |
| `GET /api/agencies/current`, `PATCH /api/agencies`, `POST /api/agencies` | `AgencyVoter::*` | **Forbidden** for clients — `AgencyRepository::getByCollaborator($user)` returns `null` for `ROLE_CLIENT` users, the controller throws `MissingAgencyException`. |
| `GET /api/subscriptions/current`, billing endpoints | resolves through agency | Read access — controllers resolve the agency via `user.clientProject.agency` so clients can know whether their portal is unlocked. Write actions (`POST /checkout`, `POST /cancel`, `POST /resume`) require `AgencyVoter::MANAGE_BILLING` and are restricted to `ROLE_ADMIN`. See `back/docs/billing-feature.md`. |
| `GET /api/onboarding`, `POST /api/onboarding/complete-step`, `POST /api/onboarding/dismiss` | `IsGranted(UserRole::User->value)` | Allowed for everyone — `OnboardingService::getApplicableStepValues` returns `ClientOnboardingStep` values for clients. |

### Voter summary for `ROLE_CLIENT`

| Voter | Attribute | Decision for clients |
|-------|-----------|----------------------|
| `ProjectVoter` | `VIEW` | ✅ when the project is `User.project` |
| `ProjectVoter` | `EDIT` | ❌ always (Editor+) |
| `ProjectVoter` | `MANAGE_INTEGRATIONS` | ✅ when the project is `User.project` |
| `ProjectVoter` | `MANAGE_CLIENT` | ❌ always (Editor+) |
| `AgencyVoter` | `VIEW` | ❌ always (no `User.agency`) |
| `AgencyVoter` | `MANAGE_SETTINGS` / `MANAGE_BILLING` / `MANAGE_COLLABORATORS` / `MANAGE_PROJECTS` | ❌ always |

## Subscription gate

`ProjectController::show` throws `AgencySubscriptionInactiveException` (code `27003`, HTTP 403) when **both**:
1. the authenticated user is `ROLE_CLIENT`, and
2. `SubscriptionRepository::getLatestActiveByAgency($project->getAgency())` returns `null` (no active row with `currentPeriodEnd >= now`).

Agency members are never gated by this check — they can always reach `GET /api/projects/{uuid}` so they can navigate to `/agency/settings/subscription` and recover. The frontend `ClientShellLayout` reads code `27003` and renders the "access suspended" full-screen card in place of the routed outlet.

## Client invitation flow

Clients are created exclusively through the polymorphic Invitation system (`back/docs/invitation-feature.md`). The short summary:

1. `POST /api/invitations` with `type=client`, `email`, `firstName`, `lastName`, `projectUuid` — gated by `ProjectVoter::MANAGE_CLIENT` (Editor+). Validates that no `User` with that email already exists.
2. `InvitationService::createForClient` persists the `Invitation` row and dispatches `SendEmailMessage(new ClientWelcomeEmailTemplate(...))`. The setup URL is `{APP_URL}/invite/{token}`.
3. The invitee opens the public `GET /api/invitations/{token}` to render the branded setup page, then submits `POST /api/invitations/{token}/complete` with their chosen password.
4. `InvitationService::completeSetup` validates the password (via `PasswordHelper`), creates the `User` with `roles=["ROLE_CLIENT"]`, `agency=null`, `project={invitation.project}`, marks the invitation as `usedAt`, and returns the user.
5. The controller sets the `X-API-TOKEN` cookie so the SPA lands authenticated on `/client/...`.

## Client onboarding

First-login walkthrough is `ClientOnboardingStep` (`back/docs/onboarding-feature.md`):
1. `WelcomeTour`
2. `ConnectFirstIntegration`
3. `ExploreContents`

`OnboardingService::getApplicableStepValues($user)` returns these three values for any `ROLE_CLIENT` user; the entity's `completed_steps` JSON stores the raw values. `WelcomeTour` and `ConnectFirstIntegration` share values with the admin and collaborator flows on purpose, so a client who briefly held another role would not redo identical steps.

## Related docs

- [agency-feature.md](agency-feature.md) — role hierarchy, voters, user payload, agency entity.
- [invitation-feature.md](invitation-feature.md) — polymorphic Invitation + setup link.
- [project-feature.md](project-feature.md) — `Project.clientUsers` collection, role-aware repository.
- [integration-oauth-feature.md](integration-oauth-feature.md) — clients can initiate OAuth on their own project.
- [billing-feature.md](billing-feature.md) — agency-rooted Subscription / CreditBalance, role-aware resolution for client requests.
- [onboarding-feature.md](onboarding-feature.md) — `ClientOnboardingStep` enum and applicable-step resolution.
