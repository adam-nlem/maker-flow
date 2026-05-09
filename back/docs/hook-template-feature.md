# Hook Template Feature - Backend Documentation

## Overview

Hook templates are reusable video hook scaffolds that any member of an agency can browse, apply to a `ScriptHook`, and (with the right authorization) edit or delete. Templates live at the **agency** level — they are shared across all collaborators of an agency — and a single template can be flagged `isPublic` to make it visible to every other agency in the platform.

A nullable `createdBy` pointer keeps a record of which user originally created a template, used solely for the edit/delete authorization gate. Removing the user does not cascade to the templates they authored: the column is nullable with `ON DELETE SET NULL`.

## Entity — `HookTemplate`

`back/src/Entity/HookTemplate.php`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `int` | Auto-increment primary key |
| `uuid` | `string` (GUID) | Public identifier exposed in API responses |
| `title` | `string(255)` | Template name |
| `content` | `TEXT` | Body containing optional `[placeholder]` tokens (see `HookTemplatePlaceholder` enum) |
| `isPublic` | `bool` | When true, the template is visible to every agency, not just `agency` |
| `createdAt` / `updatedAt` | `datetime_immutable` | Lifecycle timestamps (`HasLifecycleCallbacks`) |
| `agency` | `Agency` (ManyToOne, NOT NULL, `ON DELETE CASCADE`) | Owning agency — deleting it removes every template it owns |
| `createdBy` | `User` (ManyToOne, nullable, `ON DELETE SET NULL`) | Original creator. Cleared if the user is deleted; the template stays |

The shape mirrors the `Integration` pattern (Agency parent + nullable `createdBy` for audit) — see `back/src/Entity/Integration.php` lines 74–84.

## Repository — `HookTemplateRepository`

`back/src/Repository/HookTemplateRepository.php`

All visibility queries filter on `ht.isPublic = true OR ht.agency = :agency` directly — no JOIN through `User` is required.

| Method | Purpose |
|--------|---------|
| `getAccessibleByUuidForUser(string $uuid, User $user)` | Returns the template if it belongs to the user's agency, else `null`. Used by `update`/`delete`. Follows the codebase-wide `getAccessibleByUuidForUser` convention. |
| `getByUuid(string $uuid)` | Plain UUID lookup with no agency check (consumed by `ScriptHook` linking on the script side). |
| `getPublicOrByAgency(Agency)` / `…Paginated(Agency, int, int)` | Visibility list for the panel. |
| `searchByTitlePublicOrByAgency(string, Agency)` / `…Paginated(string, Agency, int, int)` | Same with case-insensitive `LIKE` on `title`. |

## Controller — `HookTemplateController`

`back/src/Controller/HookTemplateController.php`

Routes are mounted under `/api/hook-templates`.

| Method | Route | Role | Behavior |
|--------|-------|------|----------|
| `list` | `GET /api/hook-templates` | `ROLE_VIEWER` | Resolves `agency` via `AgencyRepository::getByCollaborator($user)`. Paginates `getPublicOrByAgencyPaginated` or `searchByTitlePublicOrByAgencyPaginated` depending on `searchTerm`. |
| `placeholders` | `GET /api/hook-templates/placeholders` | `ROLE_VIEWER` | Returns the `HookTemplatePlaceholder` enum values. |
| `create` | `POST /api/hook-templates` | `ROLE_EDITOR` | Builds a `HookTemplate` from the DTO, sets `agency = currentAgency` and `createdBy = currentUser`, persists. |
| `update` | `PATCH /api/hook-templates/{uuid}` | `ROLE_EDITOR` | Loads via `getAccessibleByUuidForUser` (throws `HookTemplateNotFoundException` if missing), then enforces the **edit gate** below before applying changes. |
| `delete` | `DELETE /api/hook-templates/{uuid}` | `ROLE_EDITOR` | Same edit gate, then removes the template. |

### Authorization layers

1. **Symfony role hierarchy** (`config/packages/security.yaml`) — every endpoint requires the role declared via `#[IsGranted]`.
2. **Agency scoping** — `getAccessibleByUuidForUser` requires the template to belong to the caller's agency. Otherwise `HookTemplateNotFoundException` (28001, HTTP 404) is thrown.
3. **Edit/delete gate** — for `update`/`delete`, the caller must be either the `createdBy` of the template **or** carry `UserRole::Admin`. Otherwise `HookTemplateModificationForbiddenException` (28002, HTTP 403) is thrown.

If the authenticated user is not attached to any agency (`AgencyRepository::getByCollaborator` returns null on `list`/`create`), `MissingAgencyException` (27001, HTTP 403) is thrown.

All exceptions extend `App\Exception\HookTemplate\HookTemplateException` (DomainCode 28). They are surfaced through `ApiExceptionSubscriber` per the [exception system](exception-system.md).

## Migration

`back/migrations/Version20260509124638.php` introduces `hook_template.agency_id` (NOT NULL, ON DELETE CASCADE), backfills it from the existing `user_id`, then renames `user_id → created_by_id` (nullable, ON DELETE SET NULL). It mirrors the `integration.user_id → created_by_id` step from `Version20260509083956.php`.

## Reused infrastructure

- `App\Entity\Agency` and `AgencyRepository::getByCollaborator(User)` — the entry point for resolving the caller's agency.
- `App\Exception\Agency\MissingAgencyException` — surfaced when a user has no agency yet.
- `App\Entity\Enum\UserRole::Admin` — used in the edit gate.

## Related serialization groups

`api_hook_templates_list`, `api_hook_templates_create`, `api_hook_templates_update`, `api_hook_templates_show`, plus `api_scripts_hooks_*` and `api_scripts_parts_list` for nested rendering when a `ScriptHook` references its source template. None of these expose `agency` or `createdBy` today — the API surface remained unchanged by this refactor.
