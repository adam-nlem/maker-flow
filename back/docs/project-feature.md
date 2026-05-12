# Project Feature - Backend Documentation

## Overview

The Project feature allows users to create, manage, and organize their projects. Each project belongs to a user and has built-in features (Tasks, Insights) always available. Projects support categorization through types and lifecycle management (finish/reopen).

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

**Constraints:**
- Unique constraint on `(name, user)` combination
- Cascade delete on user deletion

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
| `getByUuidAndUser` | `string $uuid, User $user` | `?Project` | Finds project by UUID for a specific user |
| `getByNameAndUser` | `string $name, User $user` | `?Project` | Finds project by name for a specific user |
| `getByUserPaginated` | `User $user, int $page, int $limit` | `array` | Returns paginated projects ordered by creation date (DESC) |

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
  - `404 Not Found` if project doesn't exist or doesn't belong to user
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
- **Response shape includes nested `agency`:** `uuid`, `name`, `description`, `types`, `createdAt`, `updatedAt`, `finishedAt`, and `agency: { uuid, name, brandColor, contactEmail, website }`. List endpoints (`api_projects_get_paginated`) do **not** include the agency — only this get-by-uuid response does.

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
| `api_project_get_by_uuid` | Show endpoint response | **Includes nested `agency` (uuid, name, brandColor, contactEmail, website)** so the client portal can branding without a separate request |
| `api_project_finish` | Finish endpoint response | |
| `api_project_reopen` | Reopen endpoint response | |

---

## Relationships

```
User (1) ------------ (N) Project
```

- A **User** can have multiple **Projects**
- Deleting a User cascades to delete all their Projects
