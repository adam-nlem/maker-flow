# Hook Template Feature - Backend Documentation

## Overview

The Hook Template feature provides a reusable library of video hook templates. Users can create their own hook templates or browse public ones shared by the community. Templates use placeholders (e.g. `[topic]`, `[audience]`) that users fill in when applying a template to their script. Hook templates are **user-scoped** (not tied to a specific project), and can be **public** (visible to all users) or **private** (only visible to the creator).

When a user applies a template to their script, the script's `hook` field stores the customized text, and a `hookTemplate` reference tracks which template it was based on.

---

## Entity

### `HookTemplate` (`App\Entity\HookTemplate`)

**Location:** `back/src/Entity/HookTemplate.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Template name (e.g. "Did you know") |
| `content` | `string (TEXT)` | Template text with placeholders like `[topic]` |
| `isPublic` | `bool` | If true, visible to all users (default: false) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `user` | `User` | Creator (ManyToOne, cascade delete) |

No project relation — templates are user-scoped and reusable across all projects.

---

## Enum

### `HookTemplatePlaceholder` (`App\Entity\Enum\HookTemplatePlaceholder`)

**Location:** `back/src/Entity/Enum/HookTemplatePlaceholder.php`

Reference enum of valid placeholders. Not stored as a column — used as a reference list for the frontend.

| Value | Description |
|-------|-------------|
| `topic` | Main subject of the video |
| `audience` | Target audience |
| `benefit` | Value proposition or result |
| `statistic` | Number or stat |
| `problem` | Pain point or challenge |
| `product` | Product or tool being discussed |
| `result` | Outcome or achievement |
| `emotion` | Emotional state |

Templates use `[placeholder_value]` syntax in their `content` field (e.g., `"Did you know that [topic] can [benefit]?"`). The frontend parses brackets, matches against enum values, and renders labeled inputs.

---

## Repository

### `HookTemplateRepository`

**Location:** `back/src/Repository/HookTemplateRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `HookTemplate $entity, bool $flush` | `void` | Persists a hook template |
| `remove` | `HookTemplate $entity, bool $flush` | `void` | Removes a hook template |
| `getByUuidAndUser` | `string $uuid, User $user` | `?HookTemplate` | Find by UUID and ownership (for update/delete) |
| `getByUuid` | `string $uuid` | `?HookTemplate` | Find by UUID (for linking public templates to scripts) |
| `getPublicOrByUser` | `User $user` | `HookTemplate[]` | All public templates + user's own, ordered by createdAt DESC |
| `searchByTitlePublicOrByUser` | `string $searchTerm, User $user` | `HookTemplate[]` | Same with LIKE search on title |

Query builder alias: `'ht'`.

---

## Controller

### `HookTemplateController` — Route: `/api/hook-templates`

**Location:** `back/src/Controller/HookTemplateController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| `list` | GET | `` | `api_hook_templates_list` | List public + user's own, optional searchTerm QP |
| `placeholders` | GET | `/placeholders` | `api_hook_templates_placeholders` | Returns all HookTemplatePlaceholder enum values |
| `create` | POST | `` | `api_hook_templates_create` | Create a new template |
| `update` | PATCH | `/{hookTemplateUuid}` | `api_hook_templates_update` | Update own template only |
| `delete` | DELETE | `/{hookTemplateUuid}` | `api_hook_templates_delete` | Delete own template only |

**Visibility rules:**
- `list`: Returns all public templates from any user + all of the current user's own templates (public or private).
- `update`/`delete`: Only the owner can modify/delete their templates (`getByUuidAndUser`).

---

## DTOs

### Query Param DTOs

| DTO | Properties | Validation |
|-----|------------|------------|
| `ListHookTemplatesQueryParamDTO` | `searchTerm?` | None (all optional) |

### Request DTOs

| DTO | Properties |
|-----|------------|
| `CreateHookTemplateRequestDTO` | `title`, `content`, `isPublic?` (default: false) |
| `UpdateHookTemplateRequestDTO` | `title?`, `content?`, `isPublic?` |

---

## Serialization Groups

| Group | Used In |
|-------|---------|
| `api_hook_templates_list` | Hook template list endpoint |
| `api_hook_templates_create` | Hook template create endpoint |
| `api_hook_templates_update` | Hook template update endpoint |
| `api_hook_templates_show` | Hook template show endpoint |

HookTemplate fields also include all Script groups (`api_scripts_list`, `api_scripts_create`, `api_scripts_update`, `api_scripts_show`) so the template serializes inline in script responses.

---

## Integration with Script

The `Script` entity has a nullable `hookTemplate` ManyToOne relation:

```php
#[ORM\ManyToOne]
#[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
private ?HookTemplate $hookTemplate = null;
```

- `SET NULL` on delete — if the template is deleted, the script loses the reference but keeps the customized `hook` text.
- `CreateScriptRequestDTO` and `UpdateScriptRequestDTO` both support `hookTemplateUuid`.
- `UpdateScriptRequestDTO` uses `hasHookTemplateUuid()` pattern (like `postGroupUuid`) to distinguish between "not sent" vs "sent as null" (to unlink).

---

## Relationships

```
User (1) ──────── (N) HookTemplate
Script (N) ────── (0..1) HookTemplate    [ManyToOne, nullable, SET NULL]
```
