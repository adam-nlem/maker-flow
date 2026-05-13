# Agency Feature (Backend)

## Overview

The `Agency` is the multi-tenant root of the workspace model. Every project, subscription, credit balance, and integration belongs to an Agency; users either *collaborate* on an Agency (`User.agency`, with one of `ROLE_ADMIN` / `ROLE_EDITOR` / `ROLE_VIEWER`) or are *clients* of a specific Project within an Agency (`User.project`, role `ROLE_CLIENT`).

Phases 1 & 2 introduced the entity, role enum, voters, and migration; Phase 3 finalises the user-identity payload so the frontend can route by role. Phase 5 exposes the agency profile via `GET /api/agencies/current` and `PATCH /api/agencies` (the update endpoint requires `agencyUuid` in the body so the caller targets the agency explicitly, and is then authorized via `AgencyVoter::MANAGE_SETTINGS`).

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
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
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

- `roles` is the raw Symfony role array stored on `User.roles`. Every user has `ROLE_USER` as a baseline, plus exactly one of `ROLE_ADMIN` / `ROLE_EDITOR` / `ROLE_VIEWER` / `ROLE_CLIENT`. Role-tier checks on the backend go through `User::hasRole(UserRole)`; the frontend mirrors the same model and exposes `User.hasRole(UserRole)` + an `isClient` getter.
- `clientProjectUuid` is a derived getter (`getClientProjectUuid()`) that exposes `User.project.uuid` for clients (`null` for collaborators).
- `agency` is the nested `User.agency` relation. For collaborators it is the agency they belong to. **For clients it is `null`** today — the relation `User.agency` is unset on `ROLE_CLIENT` users; the agency they ultimately belong to is reachable via `clientProjectUuid → Project.agency`. (Phase 7 will surface that to the client portal when the dashboard needs branding.)

## Voters

- `App\Security\Voter\AgencyVoter` — attributes `VIEW`, `MANAGE_PROJECTS`, `MANAGE_SETTINGS`, `MANAGE_BILLING`, `MANAGE_COLLABORATORS`. Membership + role-tier checks.
- `App\Security\Voter\ProjectVoter` — attributes `VIEW`, `EDIT`, `MANAGE_INTEGRATIONS`, `MANAGE_CLIENT`. Allows agency members and (for `VIEW` / `MANAGE_INTEGRATIONS`) project clients.

## Agency-scoped resources

- **Projects** — `Project.agency` (NOT NULL, CASCADE). Clients reach a project via `User.project`.
- **Subscription / CreditBalance** — `*.agency` (NOT NULL, CASCADE). Resolution today via `AgencyRepository::getByCollaborator($user)` (collaborators only).
- **Integration** — owned by `Project.agency`. `Integration.createdBy` is kept only for audit.

## Client-portal subscription gate (Phase 7)

`ProjectController::show` throws `AgencySubscriptionInactiveException` (code `27003`, HTTP 403) when the requester is a `ROLE_CLIENT` user whose parent agency has no active subscription. The active-subscription check reuses `SubscriptionRepository::getLatestActiveByAgency($agency)` (returns `null` when no row matches `status === Active AND currentPeriodEnd >= now`) — no helper was added to the `Agency` entity, the predicate stays at the data layer.

The client SPA reads this error in `ClientShellLayout` and renders a full-screen "access suspended" card instead of the outlet. Agency members are never gated, so they can always reach their billing settings to re-subscribe.

## Agency profile endpoints (Phase 5)

| Method | Route | Auth | Group |
| --- | --- | --- | --- |
| `GET` | `/api/agencies/current` | `ROLE_VIEWER+` (any agency member) | `api_agency_current` |
| `PATCH` | `/api/agencies` | `ROLE_ADMIN` baseline + `AgencyVoter::MANAGE_SETTINGS` defence-in-depth | `api_agency_update` |
| `POST` | `/api/agencies` | `ROLE_ADMIN`, only when user has no agency yet | `api_agency_create` |

Both `GET` and `PATCH` resolve the current agency through `AgencyRepository::getByCollaborator($user)` and throw `MissingAgencyException` when the caller has no agency (e.g. clients).

`UpdateAgencyRequestDTO` uses sparse-update semantics: only fields present in the JSON payload are applied to the entity. Validation constraints (e.g. `Assert\Regex` on `brandColor`, `Assert\Email`, `Assert\Url`) live on the entity itself and run via `AbstractRequestDTO::build()`.

The new dedicated `api_agency_current` serialization group exposes the readable fields (`uuid`, `name`, `brandColor`, `contactEmail`, `website`). It is independent from `api_agency_create` and `api_agency_update`.

## Agency logo

Agency logos live on disk by UUID — same convention as post thumbnails — so the `Agency` entity stays untouched (no `logoPath` column). Every logo is stored at the deterministic path `private/uploads/agency/logo/{agencyUuid}.png`.

| Method | Route | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/agencies/logo` | `ROLE_ADMIN` + `AgencyVoter::MANAGE_SETTINGS` | `multipart/form-data` with a `logo` file part | `204 No Content` |
| `GET` | `/api/agencies/{agencyUuid}/logo` | `ROLE_USER` baseline + ownership (user belongs to the agency as collaborator **or** through `User.project.agency`) | — | `200 OK` with the PNG (`Content-Type: image/png`, `inline` disposition) when a logo exists, **`204 No Content`** when it doesn't. |

There is no server-side placeholder: empty agencies return `204` and the frontend renders its own fallback (brand-color block with the agency's initial, or a drop zone in editable contexts).

Validation on upload (`AgencyLogoService::upload`):
- MIME type must be `image/png`.
- File size ≤ 5 MB.

Any failure raises `AgencyLogoInvalidException` (code `27004`, HTTP 400) with a `reason` meta key (`file_too_large`, `invalid_mime_type`, `missing_file`). The destination filename is fixed (`{uuid}.png`), so subsequent uploads naturally overwrite the previous logo — no manual cleanup needed.

Path is configured in `config/services.yaml`:

```yaml
app.agency.logo.directory: "%kernel.project_dir%/private/uploads/agency/logo"
```

…and injected into `App\Service\Agency\AgencyLogoService` as `$logoDirectory`. User-uploaded logos under `private/uploads/agency/logo/*` are gitignored.

## Agency creation in onboarding

Agency provisioning is its own onboarding step — it is **not** auto-bundled into `POST /api/users/register`. A freshly-registered admin lands on the frontend's `OnboardingCreateAgencyStep`, which submits to `POST /api/agencies`. The `AgencyShellLayout` redirects to `/onboarding` for any non-client user whose `agency` is still `null`, so the agency shell never renders against a null agency. See [onboarding-feature.md](onboarding-feature.md) for the `CreateAgency` step entry.

## Related docs

- [invitation-feature.md](invitation-feature.md) — how new agency members and clients are onboarded.
- [billing-feature.md](billing-feature.md) — Subscription / CreditBalance / Stripe wiring (now agency-rooted).
- [project-feature.md](project-feature.md) — Project entity (now `agency`-rooted, with `clientUsers`).
