# Module & UserModule Feature - Backend Documentation

## Overview

The Module system is the core extensibility mechanism of MakerFlow. It allows users to add functionality to their projects through modular widgets. The system consists of two main entities:

- **Module**: A template/definition of a feature (e.g., TodoList, GithubStats, Stripe)
- **UserModule**: An instance of a Module added to a specific Project by a User

### Key Concepts

```
Module (Template)          UserModule (Instance)
┌─────────────────┐        ┌─────────────────────────┐
│ TodoList        │───────▶│ User's TodoList widget  │
│ - title         │        │ - position (x, y)       │
│ - description   │        │ - size                  │
│ - isActive      │        │ - isActive/isHidden     │
│ - isPremium     │        │ - belongs to Project    │
│ - identifier    │        │ - belongs to User       │
└─────────────────┘        └─────────────────────────┘
```

**Constraint:** A user can only have **one instance** of each module per project.

---

## Entities

### Module Entity

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Entity/Module.php`

Represents a module template available in the system.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Internal auto-increment ID |
| `uuid` | `string (GUID)` | Public unique identifier |
| `title` | `string` | Display name of the module |
| `description` | `string?` | Optional description |
| `isActive` | `bool` | Whether the module is available for use |
| `isPremium` | `bool` | Whether the module requires premium subscription |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable?` | Last update timestamp (UTC) |
| `moduleIdentifier` | `ModuleIdentifier` | Unique enum identifier for the module |

#### Relationships

| Relation | Type | Target | Description |
|----------|------|--------|-------------|
| `userModules` | OneToMany | `UserModule` | All user instances of this module |

#### Serialization Groups

| Group | Fields Exposed |
|-------|----------------|
| `api_modules_list` | uuid, title, description, isActive, isPremium, createdAt, updatedAt, moduleIdentifier |
| `api_project_get_user_modules` | uuid, title, description, isActive, isPremium, createdAt, updatedAt, moduleIdentifier |
| `api_user_modules_create` | uuid, title, description, isActive, isPremium, createdAt, updatedAt, moduleIdentifier |

---

### UserModule Entity

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Entity/UserModule.php`

Represents a user's instance of a module within a specific project.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Internal auto-increment ID |
| `uuid` | `string (GUID)` | Public unique identifier |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable?` | Last update timestamp (UTC) |
| `xIndex` | `int` | Horizontal position on dashboard grid |
| `yIndex` | `int` | Vertical position on dashboard grid |
| `size` | `ModuleSize` | Widget size (small, medium, large) |
| `isActive` | `bool` | Whether the module instance is active (default: true) |
| `isHidden` | `bool` | Whether the module is hidden from view (default: false) |

#### Relationships

| Relation | Type | Target | On Delete | Description |
|----------|------|--------|-----------|-------------|
| `user` | ManyToOne | `User` | CASCADE | Owner of this module instance |
| `module` | ManyToOne | `Module` | - | The module template |
| `project` | ManyToOne | `Project` | CASCADE | Project this module belongs to |
| `integration` | ManyToOne | `Integration` | - | Optional external integration |

#### Serialization Groups

| Group | Fields Exposed |
|-------|----------------|
| `api_user_modules_create` | uuid, createdAt, updatedAt, xIndex, yIndex, size, isActive, isHidden, module |
| `api_project_get_user_modules` | uuid, createdAt, updatedAt, xIndex, yIndex, size, isActive, isHidden, module |

---

## Enums

### ModuleIdentifier

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Entity/Enum/ModuleIdentifier.php`

Unique identifier for each module type. Used to link backend modules to frontend widget implementations.

```php
enum ModuleIdentifier: string
{
    case GithubStats = 'github_stats';
    case TodoList = 'todo_list';
    case Stripe = 'stripe';
}
```

### ModuleSize

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Entity/Enum/ModuleSize.php`

Defines the display size of a module widget on the dashboard.

```php
enum ModuleSize: string
{
    case Small = 'small';
    case Medium = 'medium';
    case Large = 'large';
}
```

---

## Repositories

### ModuleRepository

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Repository/ModuleRepository.php`

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `save` | `Module $entity, bool $flush` | `void` | Persist a module |
| `remove` | `Module $entity, bool $flush` | `void` | Remove a module |
| `getByUuid` | `string $uuid` | `?Module` | Find module by UUID |
| `getByModuleIdentifier` | `string $moduleIdentifier` | `?Module` | Find module by identifier |
| `getAllPaginated` | `int $page, int $limit` | `Module[]` | Get paginated list of modules |

---

### UserModuleRepository

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Repository/UserModuleRepository.php`

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `save` | `UserModule $entity, bool $flush` | `void` | Persist a user module |
| `remove` | `UserModule $entity, bool $flush` | `void` | Remove a user module |
| `getByUserAndProject` | `User $user, Project $project` | `UserModule[]` | Get all user modules for a project |
| `getByUuidAndUser` | `string $uuid, User $user` | `?UserModule` | Find user module by UUID and owner |
| `getByUserAndProjectAndModule` | `User $user, Project $project, Module $module` | `?UserModule` | Check if user already has this module in project |

---

## Controllers

### ModuleController

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Controller/ModuleController.php`

**Base Route:** `/api/modules`

#### Endpoints

##### List Modules

```
GET /api/modules
```

Returns a paginated list of all available modules.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `int` | Yes | Page number (1-indexed) |
| `limit` | `int` | Yes | Items per page |

**Response:** `200 OK`
```json
[
    {
        "uuid": "...",
        "title": "Todo List",
        "description": "Manage your tasks",
        "isActive": true,
        "isPremium": false,
        "createdAt": "2024-01-01T00:00:00+00:00",
        "updatedAt": null,
        "moduleIdentifier": "todo_list"
    }
]
```

---

##### Get Module Icon

```
GET /api/modules/{moduleIdentifier}/icon
```

Returns the SVG icon for a module.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `moduleIdentifier` | `string` | The module's identifier (e.g., `todo_list`) |

**Response:** `200 OK` - Binary SVG file

**Error Response:** `404 Not Found` - If module doesn't exist

---

### UserModuleController

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Controller/UserModuleController.php`

**Base Route:** `/api/user-modules`

#### Endpoints

##### Create UserModule

```
POST /api/user-modules
```

Adds a module to a user's project.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moduleUuid` | `string` | Yes | UUID of the module to add |
| `projectUuid` | `string` | Yes | UUID of the target project |

**Response:** `200 OK`
```json
{
    "uuid": "...",
    "createdAt": "2024-01-01T00:00:00+00:00",
    "updatedAt": null,
    "xIndex": 1,
    "yIndex": 1,
    "size": "large",
    "isActive": true,
    "isHidden": false,
    "module": {
        "uuid": "...",
        "title": "Todo List",
        "moduleIdentifier": "todo_list",
        ...
    }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Module with given UUID doesn't exist |
| `404 Not Found` | User doesn't have a project with given UUID |
| `409 Conflict` | User already has this module in this project |

---

### ProjectController (UserModule-related)

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Controller/ProjectController.php`

##### Get Project UserModules

```
GET /api/projects/{projectUuid}/user-modules
```

Returns all user modules for a specific project.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `projectUuid` | `string` | UUID of the project |

**Response:** `200 OK`
```json
[
    {
        "uuid": "...",
        "xIndex": 1,
        "yIndex": 1,
        "size": "large",
        "isActive": true,
        "isHidden": false,
        "module": {
            "uuid": "...",
            "title": "Todo List",
            "moduleIdentifier": "todo_list",
            ...
        }
    }
]
```

**Error Response:** `404 Not Found` - If project doesn't exist or doesn't belong to user

---

## DTOs

### CreateUserModuleRequestDTO

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/DTO/Request/UserModule/CreateUserModuleRequestDTO.php`

| Property | Type | Description |
|----------|------|-------------|
| `moduleUuid` | `string` | UUID of the module to add |
| `projectUuid` | `string` | UUID of the target project |

---

### ListModulesQueryParamDTO

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/DTO/QueryParam/Module/ListModulesQueryParamDTO.php`

| Property | Type | Validation | Description |
|----------|------|------------|-------------|
| `page` | `int` | NotBlank, Positive | Page number |
| `limit` | `int` | NotBlank, Positive | Items per page |

---

## Services

### ModuleService

**Location:** `@/Users/adam/1-dev/projets/maker-flow/back/src/Service/Module/ModuleService.php`

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getModuleIcon` | `string $moduleIdentifier` | `File` | Returns the icon file for a module, or placeholder if not found |

**Icon Storage:** Icons are stored as SVG files at the path configured in `moduleIconPath` service parameter.

---

## Data Flow

### Adding a Module to a Project

```
1. User selects a module from the library
2. Frontend calls POST /api/user-modules with moduleUuid and projectUuid
3. Backend validates:
   - Module exists
   - Project exists and belongs to user
   - User doesn't already have this module in this project
4. Creates UserModule with default position (1,1) and size (Large)
5. Returns the created UserModule with embedded Module data
6. Frontend invalidates project userModules query to refresh dashboard
```

### Loading Project Dashboard

```
1. User navigates to project dashboard
2. Frontend calls GET /api/projects/{uuid}/user-modules
3. Backend returns all UserModules for the project with embedded Module data
4. Frontend renders widgets based on moduleIdentifier
5. Each widget uses userModuleUuid to fetch its specific data
```

---

## Business Rules

1. **One instance per project:** A user cannot add the same module twice to a single project
2. **User ownership:** Users can only access their own projects and user modules
3. **Cascade delete:** When a project is deleted, all its user modules are deleted
4. **Cascade delete:** When a user is deleted, all their user modules are deleted
5. **Default values:** New user modules are created with `isActive=true`, `isHidden=false`
6. **Module availability:** Only modules with `isActive=true` should be shown in the library
7. **Premium modules:** Modules with `isPremium=true` require subscription (not yet implemented)
