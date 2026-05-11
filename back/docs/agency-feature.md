# Agency Feature (Backend)

## Overview

The `Agency` is the multi-tenant root of the workspace model. Every project, subscription, credit balance, and integration belongs to an Agency; users either *collaborate* on an Agency (`User.agency`, with one of `ROLE_ADMIN` / `ROLE_EDITOR` / `ROLE_VIEWER`) or are *clients* of a specific Project within an Agency (`User.project`, role `ROLE_CLIENT`).

Phases 1 & 2 introduced the entity, role enum, voters, and migration; Phase 3 finalises the user-identity payload so the frontend can route by role.

## Role hierarchy

`config/packages/security.yaml`:

```yaml
role_hierarchy:
    ROLE_ADMIN: [ ROLE_EDITOR ]
    ROLE_EDITOR: [ ROLE_VIEWER ]
    ROLE_VIEWER: [ ROLE_USER ]
    ROLE_CLIENT: [ ROLE_USER ]
```

`UserRole` (`Entity/Enum/UserRole.php`) is the typed mirror used in `#[IsGranted(...)]` attributes.

## User identity payload

`GET /api/users/me` (and the `api_otp_verify_login` / `api_otp_verify_email` groups) returns:

```json
{
  "uuid": "…",
  "firstName": "…",
  "lastName": "…",
  "email": "…",
  "createdAt": "…",
  "verifiedAt": "…",
  "referralCode": null,
  "role": "ROLE_ADMIN",
  "clientProjectUuid": null,
  "agency": {
    "uuid": "…",
    "name": "Acme Studio",
    "brandColor": "#1F2937",
    "contactEmail": "hello@acme.studio",
    "website": "https://acme.studio"
  }
}
```

- `role` is a derived getter on `User` (`getRole()`) returning the highest-precedence non-`ROLE_USER` role, or `null`. Precedence order: `ROLE_ADMIN > ROLE_EDITOR > ROLE_VIEWER > ROLE_CLIENT`.
- `clientProjectUuid` is a derived getter (`getClientProjectUuid()`) that exposes `User.project.uuid` for clients (`null` for collaborators).
- `agency` is the nested `User.agency` relation. For collaborators it is the agency they belong to. **For clients it is `null`** today — the relation `User.agency` is unset on `ROLE_CLIENT` users; the agency they ultimately belong to is reachable via `clientProjectUuid → Project.agency`. (Phase 7 will surface that to the client portal when the dashboard needs branding.)

## Voters

- `App\Security\Voter\AgencyVoter` — attributes `VIEW`, `MANAGE_PROJECTS`, `MANAGE_SETTINGS`, `MANAGE_BILLING`, `MANAGE_COLLABORATORS`. Membership + role-tier checks.
- `App\Security\Voter\ProjectVoter` — attributes `VIEW`, `EDIT`, `MANAGE_INTEGRATIONS`, `MANAGE_CLIENT`. Allows agency members and (for `VIEW` / `MANAGE_INTEGRATIONS`) project clients.

## Agency-scoped resources

- **Projects** — `Project.agency` (NOT NULL, CASCADE). Clients reach a project via `User.project`.
- **Subscription / CreditBalance** — `*.agency` (NOT NULL, CASCADE). Resolution today via `AgencyRepository::getByCollaborator($user)` (collaborators only). Phase 7 will introduce a `getByUser()` fallback that walks `User.project.agency` for clients.
- **Integration** — owned by `Project.agency`. `Integration.createdBy` is kept only for audit.

## Agency creation in onboarding

Agency provisioning is its own onboarding step — it is **not** auto-bundled into `POST /api/users/register`. A freshly-registered admin lands on the frontend's `OnboardingCreateAgencyStep`, which submits to `POST /api/agencies`. The `AgencyShellLayout` redirects to `/onboarding` for any non-client user whose `agency` is still `null`, so the agency shell never renders against a null agency. See [onboarding-feature.md](onboarding-feature.md) for the `CreateAgency` step entry.

## Related docs

- [invitation-feature.md](invitation-feature.md) — how new agency members and clients are onboarded.
- [billing-feature.md](billing-feature.md) — Subscription / CreditBalance / Stripe wiring (now agency-rooted).
- [project-feature.md](project-feature.md) — Project entity (now `agency`-rooted, with `clientUsers`).
