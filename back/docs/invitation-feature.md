# Invitation Feature (Backend)

## Overview

Polymorphic invitation system used to onboard new agency members:

1. **Collaborator invitation** — An admin invites someone to join their agency as `ROLE_EDITOR` or `ROLE_VIEWER`.
2. **Client invitation** — An editor (or admin) invites a brand-owner client to one specific project.

Both flows share the same `Invitation` entity and the same public token endpoints. The invitee receives a tokenized email link, lands on the FE setup page (Phase 6), submits a password, and is logged in via the standard `Token` cookie.

## Invitation Specification

- **Token format**: 64-char hex string (`bin2hex(random_bytes(32))`), stored unique-indexed
- **Expiration**: 7 days
- **Single-use**: `usedAt` is set on completion; subsequent verifications fail with `InvitationAlreadyUsedException`
- **Re-invite behaviour**: invalidates any pending unused invitation for the same `(email, scope)` pair before issuing a new one (mirrors `OtpService::invalidateAllForUser`)
- **Removal behaviour**: when a collaborator/client is removed, their `agency`/`project` is set to `null` and all their `Token` rows are deleted so existing sessions immediately fail auth
- **Email-uniqueness**: an email cannot be invited if a `User` with that address already exists (`EmailAlreadyUsedException`, 409)

## Architecture

### Entities

**`InvitationType` enum** (`Entity/Enum/InvitationType.php`)
- `Collaborator` — agency-wide membership (Editor / Viewer)
- `Client` — project-scoped read-only access (auto-assigned `ROLE_CLIENT`)

**`Invitation` entity** (`Entity/Invitation.php`)
- `uuid` — public identifier
- `token` — 64-char hex secret used in the setup URL
- `type` — `InvitationType`
- `email`, `firstName`, `lastName` — pre-fill values for the new user
- `role` — `UserRole` (nullable; required for collaborator, must be `Editor` or `Viewer`)
- `agency` — ManyToOne to `Agency` (NOT NULL, CASCADE)
- `project` — ManyToOne to `Project` (nullable, CASCADE; required for client invitations)
- `createdBy` — ManyToOne to `User` (nullable, SET NULL for audit retention)
- `expiresAt`, `usedAt`, `createdAt` — timestamps
- `isExpired()` / `isUsed()` helpers

### Repository (`Repository/InvitationRepository.php`)

- `getByToken(string)` — token lookup with `HINT_INCLUDE_META_COLUMNS`
- `invalidatePendingForCollaborator(email, Agency)` / `invalidatePendingForClient(email, Project)` — DQL `UPDATE` setting `usedAt = now` on un-used rows; called before creating a new invitation to keep the pending list clean
- `findPendingForAgency(Agency)` / `findPendingForProject(Project)` — `usedAt IS NULL AND expiresAt > now`, used by the listing endpoints

### Service (`Service/Invitation/InvitationService.php`)

- `createForCollaborator(Agency, User $createdBy, email, firstName, lastName, UserRole)` — validates role, checks email uniqueness, invalidates previous pending, persists, dispatches `SendEmailMessage` with `CollaboratorWelcomeEmailTemplate`
- `createForClient(Project, User $createdBy, email, firstName, lastName)` — same shape, dispatches `ClientWelcomeEmailTemplate`
- `verifyToken(string): Invitation` — throws `InvitationNotFoundException` (404), `InvitationAlreadyUsedException` (422), `InvitationExpiredException` (422)
- `completeSetup(Invitation, plainPassword): User` — re-verifies, validates password via `PasswordHelper`, builds + persists `User` (sets `agency` for collaborator / `project` for client, applies role), marks invitation `usedAt`, returns the new user
- `generateUniqueToken()` / `buildSetupUrl()` — internal helpers; the URL pattern is `{FRONTEND_URL}/invite/{token}`
- `$frontendUrl` is bound from `app.frontend_url` in `config/services.yaml`

### Email Templates (`Service/Mailing/Template/`)

- `CollaboratorWelcomeEmailTemplate` — subject `Rejoignez l'agence {agencyName} sur MakerFlow`, body mentions inviter name + role + 7-day expiry
- `ClientWelcomeEmailTemplate` — subject `Bienvenue sur votre portail {agencyName}`, body tints heading and CTA with `agency.brandColor` (fallback `#141115`); includes the agency's `contactEmail` when present

Both extend `AbstractEmailTemplate` and reuse the existing `SendEmailMessage` / `SendEmailHandler` pipeline (Resend over RabbitMQ).

### Exceptions (`Exception/Invitation/`)

| Full code | Exception | HTTP | Description |
|-----------|-----------|------|-------------|
| 29001 | `InvitationNotFoundException` | 404 | Token does not match any invitation |
| 29002 | `InvitationExpiredException` | 422 | `expiresAt` is in the past |
| 29003 | `InvitationAlreadyUsedException` | 422 | `usedAt` is already set |
| 29004 | `EmailAlreadyUsedException` | 409 | A `User` with that email already exists |
| 29005 | `InvalidInvitationRoleException` | 422 | Role is not `ROLE_EDITOR` or `ROLE_VIEWER` |
| 29006 | `InvalidInvitationTypeException` | 422 | `type` is missing or not one of `collaborator` / `client` |
| 29007 | `InvalidInvitationProjectException` | 422 | `type=client` but `projectUuid` is missing |

`InvitationException` (abstract) returns `DomainCode::Invitation = 29`.

### Request DTOs

- `App\DTO\Request\Invitation\CreateInvitationRequestDTO` — fields: `type` (`?InvitationType` via `tryFrom`), `email` (`Assert\NotBlank` + `Assert\Email`), `firstName`, `lastName` (both `Assert\NotBlank`), `role` (`?UserRole` via `tryFrom`, required for `type=collaborator`), `projectUuid` (`?string` with `Assert\Uuid` when present, required for `type=client`).
- `App\DTO\Request\Invitation\CompleteInvitationRequestDTO` — field: `password`.

### Query-param DTOs

- `App\DTO\QueryParam\ProjectClient\ListProjectClientsQueryParamDTO` — single field `projectUuid` (`Assert\NotBlank` + `Assert\Uuid`). Drives `GET /api/projects/clients`.

### Response DTOs

- `App\DTO\Response\AgencyCollaborator\ListAgencyCollaboratorsResponseDTO` — wraps `{collaborators, pendingInvitations}` for `GET /api/agencies/collaborators`.
- `App\DTO\Response\ProjectClient\ListProjectClientsResponseDTO` — wraps `{clients, pendingInvitations}` for `GET /api/projects/clients`.

### Serialization groups

Responses are produced by Symfony's serializer using groups declared on the entities — no per-shape response DTO. The relevant groups:

- `api_invitation_show` — used by the public summary endpoint (`GET /api/invitations/{token}`). Tagged on `Invitation` (uuid, type, email, firstName, lastName, role, expiresAt, createdAt, agency, project, createdBy), `Agency.name` + `Agency.brandColor`, `Project.name`, `User.firstName` + `User.lastName` (so the `createdBy` sub-object only exposes a display name).
- `api_invitation_create` — used by the create-invitation responses (`POST /api/agencies/collaborators` and `POST /api/projects/clients`). Tagged on the same properties as `api_invitation_show` so the response shape matches.
- `api_invitations_list` — used by the listing endpoints for pending rows. Tagged on `Invitation` (uuid, email, firstName, lastName, role, expiresAt, createdAt). Relations are intentionally not tagged so listings stay flat.
- `api_collaborators_list` — tagged on `User` (uuid, firstName, lastName, email, roles).
- `api_clients_list` — tagged on `User` (uuid, firstName, lastName, email). No role since clients are uniformly `ROLE_CLIENT`.

## API Endpoints

### `InvitationController` (`/api/invitations`)

| Endpoint | Method | Route Name | Auth | Description |
|----------|--------|------------|------|-------------|
| `/api/invitations` | POST | `api_invitations_create` | `ROLE_USER` (per-type checks below) | Unified create endpoint. Body: `CreateInvitationRequestDTO`. Branches on `type`: `collaborator` requires `ROLE_ADMIN` and the inviter's agency, `client` requires `ROLE_EDITOR` + `ProjectVoter::MANAGE_CLIENT` on `projectUuid`. Returns 201 + invitation (`api_invitation_create`). |
| `/api/invitations/{token}` | GET | `api_invitations_show` | Public | Returns the invitation serialized with `api_invitation_show` |
| `/api/invitations/{token}/complete` | POST | `api_invitations_complete` | Public | Completes setup, creates the user, returns user JSON (`api_user_me`) + sets `X-API-TOKEN` cookie |

Public routes (`show`, `complete`) are listed in `TokenAuthenticator::EXCLUDED_ROUTES` and whitelisted by `^/api/invitations/` in `security.yaml`'s `access_control`. The `create` action is authenticated and goes through `TokenAuthenticator` like every other authenticated endpoint.

### Agency creation — `AgencyController` (`/api/agencies`)

| Endpoint | Method | Route Name | Auth | Description |
|----------|--------|------------|------|-------------|
| `/api/agencies` | POST | `api_agencies_create` | `ROLE_ADMIN` | Onboarding step: admin creates their agency. Body: `{name, brandColor?, contactEmail?, website?}`. 409 `27002` if the user already has one. |

`ROLE_ADMIN` is granted to every newly-registered user (`UserController::register` calls `$user->setRole(UserRole::Admin)`), so the registration flow naturally feeds the agency-creation step. Collaborators / clients arrive via invitations and never get `ROLE_ADMIN`.

### Agency collaborators — `AgencyCollaboratorController` (`/api/agencies/collaborators`)

| Endpoint | Method | Route Name | Auth | Description |
|----------|--------|------------|------|-------------|
| `/api/agencies/collaborators` | GET | `api_agencies_collaborators_list` | `ROLE_VIEWER` | `{collaborators: [...], pendingInvitations: [...]}` via `ListAgencyCollaboratorsResponseDTO` (groups: `api_collaborators_list`, `api_invitations_list`) |
| `/api/agencies/collaborators/{userUuid}` | DELETE | `api_agencies_collaborators_remove` | `ROLE_ADMIN` | Soft-unlink + revoke tokens. 404 `31001` (`AgencyCollaboratorNotFoundException`) if the user isn't a collaborator of the current agency. |

Inviting a collaborator now lives on `POST /api/invitations` with `type=collaborator` (see the `InvitationController` section above).

The agency is resolved with `AgencyRepository::getByCollaborator($user)` and throws `MissingAgencyException` (27001) if the user is not attached to one.

### Project clients — `ProjectClientController` (`/api/projects/clients`)

| Endpoint | Method | Route Name | Auth | Voter | Description |
|----------|--------|------------|------|-------|-------------|
| `/api/projects/clients?projectUuid={uuid}` | GET | `api_projects_clients_list` | `ROLE_VIEWER` | `ProjectVoter::VIEW` | Driven by `ListProjectClientsQueryParamDTO`. Returns `{clients, pendingInvitations}` via `ListProjectClientsResponseDTO` (groups: `api_clients_list`, `api_invitations_list`). |
| `/api/projects/clients/{clientUserUuid}` | DELETE | `api_projects_clients_remove` | `ROLE_EDITOR` | `ProjectVoter::MANAGE_CLIENT` | Soft-unlink + revoke tokens. 404 `30001` (`ProjectClientNotFoundException`) if the user has no project. The voter on `target.project` enforces cross-agency access. |

Inviting a client now lives on `POST /api/invitations` with `type=client` (see the `InvitationController` section above).

`ROLE_VIEWER` excludes `ROLE_CLIENT` per the role hierarchy (`ROLE_CLIENT` only inherits `ROLE_USER`), so clients cannot list members. Path / body / query-string layout follows the codebase convention: parent UUIDs are passed in the body or query string, never in the path; only the resource being acted on (DELETE target) is identified by a path-param UUID.

## End-to-end Flow

### Agency owner onboarding
1. `POST /api/users/register` `{firstName, lastName, email, password}` → user created with `roles: ["ROLE_USER", "ROLE_ADMIN"]` and no agency.
2. Email-verification OTP → cookie set.
3. `POST /api/agencies` `{name, brandColor?, contactEmail?, website?}` → agency persisted, user linked, welcome credits granted, returned via `api_agency_create`.

### Collaborator
1. Admin: `POST /api/invitations` `{type: 'collaborator', firstName, lastName, email, role: 'ROLE_EDITOR'}` → 201 + invitation entity (`api_invitation_create`)
2. `SendEmailMessage` is dispatched, the worker emails `{FRONTEND_URL}/invite/{token}`
3. Public: `GET /api/invitations/{token}` → 200 with the invitation serialized via `api_invitation_show`
4. Public: `POST /api/invitations/{token}/complete` `{password}` → 200 with `User`, `Set-Cookie: X-API-TOKEN`
5. Resulting `User` has `roles` containing `ROLE_EDITOR`, `agency_id` set, `verified_at` populated; `Invitation.used_at` populated

### Client
1. Editor: `POST /api/invitations` `{type: 'client', firstName, lastName, email, projectUuid}` → 201 + invitation
2. Email goes out with the agency's `brandColor` accent
3. Same public flow → resulting `User` has `project_id` set, `roles` contains `ROLE_CLIENT`, `agency_id` is `NULL`

### Removal
- `DELETE /api/agencies/collaborators/{uuid}` → `agency_id = NULL` for the target, all their `Token` rows are deleted (next request fails `TokenAuthenticator`)
- `DELETE /api/projects/clients/{uuid}` → `project_id = NULL`, tokens deleted

## Migration

`Version20260510091238` creates the `invitation` table (UUID, token unique index, FK to agency/project/user). No data migration — there are no pre-existing invitations.
