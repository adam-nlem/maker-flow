# Project Feature - Backend Documentation

## Overview

The Project feature allows agencies to create, manage, and organize projects on behalf of their clients. Each project belongs to a single **Agency** (its workspace) and may have any number of **Client Users** attached to it (`Project.clientUsers`). Built-in features (Tasks, Insights) are always available. Projects support categorization through types and lifecycle management (finish/reopen).

Access control is enforced by `ProjectVoter` (see `back/docs/agency-feature.md`):
- Agency members (Admin / Editor / Viewer) reach any project of their agency through `VIEW`.
- Clients reach only the project referenced by their `User.project` FK.
- Mutations (`EDIT`, `MANAGE_INTEGRATIONS`, `MANAGE_CLIENT`) gate on `ROLE_EDITOR` or above, with one carve-out: clients can run `MANAGE_INTEGRATIONS` on their own project so they can connect their own social accounts from the portal (see `back/docs/integration-oauth-feature.md`).

---

## Entity

### `Project` (`App\Entity\Project`)

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Entity/Project.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `name` | `string (255)` | Project name |
| `description` | `string (TEXT)` | Optional project description |
| `types` | `ProjectType[]` | Array of project types (enum) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `finishedAt` | `DateTimeImmutable` | Completion timestamp (nullable) |
| `agency` | `Agency` | Owning agency (ManyToOne, NOT NULL) — also serialized under `api_project_get_by_uuid` |
| `clientUsers` | `Collection<User>` | OneToMany inverse of `User.project`. Lists the Client Users attached to this project; agency members of the project's agency are **not** in this collection (they reach the project via `Project.agency` instead). |

**Constraints:**
- Unique constraint on `(name, agency)` combination — two projects in the same agency cannot share a name; two agencies can.
- Cascade delete on agency removal. Removing the agency removes the project; removing a client user only nulls their `User.project` FK (no project deletion).

**Lifecycle Callbacks:**
- `@PreUpdate`: Automatically sets `updatedAt` to current UTC time

---

## Enum

### `ProjectType` (`App\Entity\Enum\ProjectType`)

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Entity/Enum/ProjectType.php`

| Value | Description |
|-------|-------------|
| `saas` | SaaS application |
| `content_creation` | Content creation project |
| `mobile_app` | Mobile application |
| `extension` | Browser/app extension |
| `automation` | Automation project |
| `web_app` | Web application |
| `landing_page` | Landing page |
| `blog` | Blog |
| `portfolio` | Portfolio |
| `hardware` | Hardware project |
| `iot` | IoT project |

---

## Repository

### `ProjectRepository` (`App\Repository\ProjectRepository`)

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Repository/ProjectRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `Project $entity, bool $flush` | `void` | Persists a project |
| `remove` | `Project $entity, bool $flush` | `void` | Removes a project |
| `getByUuidAndAgency` | `string $uuid, Agency $agency` | `?Project` | Finds a project by UUID scoped to a specific agency (used by agency-side controllers after the voter check). |
| `getAccessibleByUuidForUser` | `string $uuid, User $user` | `?Project` | Resolves a project visible to the current user: either inside their agency, or referenced by their `User.project` if they are a client. The single repository entry point used by endpoints reachable from both shells. |
| `getByNameAndAgency` | `string $name, Agency $agency` | `?Project` | Used by uniqueness checks during create/rename. |
| `countByAgency` | `Agency $agency` | `int` | Used by the plan-limit guard on `POST /api/projects`. |
| `getByAgencyPaginated` | `Agency $agency, int $page, int $limit` | `array` | Paginated agency project list ordered by `createdAt DESC`. |
| `getAccessibleByUserPaginated` | `User $user, int $page, int $limit` | `array` | Role-aware paginated list used by `GET /api/projects`. Agency members get the agency's projects; clients get exactly one row on page 1 (their `User.project`) and an empty array on subsequent pages. |

---

## DTOs

### Request DTOs

#### `CreateProjectRequestDTO`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/DTO/Request/Project/CreateProjectRequestDTO.php`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Project name |
| `description` | `string` | No | Project description |
| `types` | `string[]` | No | Array of project type values |

#### `UpdateProjectRequestDTO`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/DTO/Request/Project/UpdateProjectRequestDTO.php`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | New project name |
| `description` | `string` | No | New project description |
| `types` | `string[]` | No | New array of project type values |

### Query Param DTOs

#### `ListProjectsQueryParamDTO`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/DTO/QueryParam/Project/ListProjectsQueryParamDTO.php`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `page` | `int` | Yes | NotBlank, Positive |
| `limit` | `int` | Yes | NotBlank, Positive |

---

## Controller

### `ProjectController` (`App\Controller\ProjectController`)

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Controller/ProjectController.php`

**Base Route:** `/api/projects`

### Endpoints

#### Create Project
- **Route:** `POST /api/projects`
- **Name:** `api_projects_create`
- **Request Body:** `CreateProjectRequestDTO`
- **Response:** `200 OK` with created project
- **Serialization Group:** `api_project_create`
- **Error:** `409 Conflict` if validation fails

#### Update Project
- **Route:** `PATCH /api/projects/{projectUuid}`
- **Name:** `api_projects_update`
- **Request Body:** `UpdateProjectRequestDTO`
- **Response:** `200 OK` with updated project
- **Serialization Group:** `api_project_update`
- **Errors:**
  - `404 Not Found` if project doesn't exist or isn't visible to the current user (per `ProjectVoter::VIEW`)
  - `409 Conflict` if name already used by another project

#### Get Project
- **Route:** `GET /api/projects/{projectUuid}`
- **Name:** `api_projects_show`
- **Response:** `200 OK` with project details
- **Serialization Group:** `api_project_get_by_uuid`
- **Errors:**
  - `404 Not Found` if project doesn't exist
  - `403 Forbidden` with code `27003` (`AgencySubscriptionInactiveException`) when the requester is a `ROLE_CLIENT` user whose parent agency has no active subscription. Agency members are never gated by this check. The client portal relies on this error to render its "access suspended" lock screen.
- **Access:** Agency members on any project of their agency (`ProjectVoter::VIEW`), and the client user(s) linked to the project. The client portal uses this endpoint to read the parent agency for sidebar branding.
- **Response shape includes nested `agency`:** `uuid`, `name`, `description`, `types`, `createdAt`, `updatedAt`, `finishedAt`, and `agency: { uuid, name, contactEmail, website }`. List endpoints (`api_projects_get_paginated`) do **not** include the agency — only this get-by-uuid response does.

#### List Projects (Paginated)
- **Route:** `GET /api/projects`
- **Name:** `api_projects_list`
- **Query Params:** `page`, `limit`
- **Response:** `200 OK` with array of projects
- **Serialization Group:** `api_projects_get_paginated`
- **Role-aware result** (resolved in `ProjectRepository::getAccessibleByUserPaginated($user, $page, $limit)`):
  - **Agency members** (Admin / Editor / Viewer): returns the agency's projects, paginated by `createdAt DESC`.
  - **Clients** (`ROLE_CLIENT`): runs the same paginated DQL filtered by `p = :clientProject`, which naturally returns one row on page 1 and an empty array on subsequent pages — no special-case wrapper logic.

  The endpoint is intentionally the same for both roles. `IsGranted(UserRole::User->value)` allows every authenticated user; access control is enforced inside the repository query.

#### Delete Project
- **Route:** `DELETE /api/projects/{projectUuid}`
- **Name:** `api_projects_delete`
- **Response:** `200 OK` with success message
- **Error:** `404 Not Found` if project doesn't exist

#### Finish Project
- **Route:** `POST /api/projects/{projectUuid}/finish`
- **Name:** `api_projects_finish`
- **Response:** `200 OK` with updated project
- **Serialization Group:** `api_project_finish`
- **Errors:**
  - `404 Not Found` if project doesn't exist
  - `304 Not Modified` if project already finished

#### Reopen Project
- **Route:** `POST /api/projects/{projectUuid}/reopen`
- **Name:** `api_projects_reopen`
- **Response:** `200 OK` with updated project
- **Serialization Group:** `api_project_reopen`
- **Errors:**
  - `404 Not Found` if project doesn't exist
  - `304 Not Modified` if project already open

---

## Serialization Groups

| Group | Used In | Notes |
|-------|---------|-------|
| `api_project_create` | Create endpoint response | |
| `api_project_update` | Update endpoint response | |
| `api_projects_get_paginated` | List endpoint response | No agency field |
| `api_project_get_by_uuid` | Show endpoint response | Includes nested `agency` (`uuid`, `name`, `contactEmail`, `website`) so the client portal can read agency identity without a separate request |
| `api_project_finish` | Finish endpoint response | |
| `api_project_reopen` | Reopen endpoint response | |

---

## Relationships

```
Agency (1) ----------- (N) Project (N) ----------- (N) User (clientUsers)
                              |                          (via User.project FK)
                              └─── ProjectVoter ─── agency members of the same agency
```

- A **Project** belongs to exactly one **Agency** (NOT NULL FK, CASCADE on agency removal).
- A **Project** can have any number of **Client Users** via `Project.clientUsers` (inverse of `User.project`). Removing a client user only nulls their `project` FK; the project survives.
- **Agency members** (`ROLE_ADMIN` / `ROLE_EDITOR` / `ROLE_VIEWER`) reach a project via `Project.agency` and `ProjectVoter::VIEW`. They are not stored on the project itself — agency membership lives on `User.agency`.
- Project-scoped client management endpoints (`GET /api/projects/{uuid}/clients`, `DELETE …`) are documented in `back/docs/invitation-feature.md` (the polymorphic Invitation system creates client users; the project-clients controller manages and lists them).
