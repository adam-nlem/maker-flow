# Project Feature - Frontend Documentation

## Overview

The Project feature provides a complete UI for managing projects including creation, selection, update, and deletion. It uses React Query for data fetching, Zustand for state management, and integrates with the sidebar navigation.

---

## Data Model

### `Project` Class

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/models/Project.ts`

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Unique identifier (readonly) |
| `name` | `string` | Project name |
| `description` | `string` | Project description |
| `types` | `ProjectType[]` | Array of project types |
| `createdAt` | `Date` | Creation date (readonly) |
| `updatedAt` | `Date` | Last update date (optional, readonly) |
| `finishedAt` | `Date` | Completion date (optional, readonly) |

**Methods:**
- `static fromJSON(json)`: Creates a Project instance from API response
- `toJSON()`: Serializes the project to JSON format
- `get isFinished`: Returns `true` if project has a `finishedAt` date

### `ProjectType` Enum

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/models/enums/ProjectType.ts`

| Value | French Translation |
|-------|-------------------|
| `saas` | SaaS |
| `content_creation` | Creation de contenu |
| `mobile_app` | Application mobile |
| `extension` | Extension |
| `automation` | Automatisation |
| `web_app` | Application web |
| `landing_page` | Landing page |
| `blog` | Blog |
| `portfolio` | Portfolio |
| `hardware` | Hardware |
| `iot` | IoT |

**Helper:** `projectTypeToFrenchTranslation` - Record mapping enum values to French labels

---

## API Hooks

### `useCreateProject`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/useCreateProject.ts`

Creates a new project.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `createProject` | `(data) => Promise<Project>` | Mutation function |
| `isPending` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `reset` | `() => void` | Reset mutation state |

**Input Data:**
```typescript
{
  name: string;
  description: string;
  types: ProjectType[];
}
```

---

### `useUpdateProject`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/useUpdateProject.ts`

Updates an existing project.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `updateProject` | `(data) => Promise<void>` | Mutation function |
| `isPending` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `reset` | `() => void` | Reset mutation state |

**Input Data:**
```typescript
{
  projectUuid: string;
  name: string;
  description: string;
  types: ProjectType[];
}
```

---

### `useDeleteProject`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/useDeleteProject.ts`

Deletes a project.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `deleteProject` | `(projectUuid: string) => Promise<void>` | Mutation function |
| `isPending` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `reset` | `() => void` | Reset mutation state |

---

### `useListPaginatedProjects`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/useListPaginatedProjects.ts`

Fetches paginated list of projects with infinite scroll support.

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `10` | Items per page |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `projects` | `Project[]` | All loaded projects |
| `isLoading` | `boolean` | Initial loading state |
| `isLoadingMore` | `boolean` | Loading more state |
| `hasMore` | `boolean` | More pages available |
| `error` | `Error \| null` | Error state |
| `listMore` | `() => Promise<void>` | Load next page |

---

### `useSelectFocusedProject`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/useSelectFocusedProject.ts`

Manages the currently focused/selected project.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `projects` | `Project[]` | Available projects |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `focusedProjectUuid` | `string \| null` | Currently focused project UUID |
| `setFocusedProjectUuid` | `(uuid: string \| null) => void` | Set focused project |

**Behavior:**
- Auto-selects first project if none selected
- Auto-selects first project if current selection no longer exists in list

---

### Query Keys

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/projectQueryKeys.ts`

```typescript
projectQueryKeys = {
  all: ['projects'],
  list: (page, limit) => ['projects', 'list', page, limit],
}
```

---

## Zustand Stores

### `useFocusProjectStore`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/stores/project/focusProjectStore.ts`

Persists the focused project UUID in localStorage.

| State/Action | Type | Description |
|--------------|------|-------------|
| `focusedProjectUuid` | `string \| null` | Currently focused project |
| `setFocusedProjectUuid` | `(uuid) => void` | Update focused project |

**LocalStorage Key:** `app:project:focused`

---

### `useCreateProjectModalStore`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/stores/project/createProjectModalStore.ts`

| State/Action | Type | Description |
|--------------|------|-------------|
| `isCreateModalOpen` | `boolean` | Modal visibility |
| `setIsCreateModalOpen` | `(isOpen) => void` | Toggle modal |

---

### `useUpdateProjectStore`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/stores/project/updateProjectStore.ts`

| State/Action | Type | Description |
|--------------|------|-------------|
| `updatingProjectUuid` | `string \| null` | Project being updated |
| `setUpdatingProjectUuid` | `(uuid) => void` | Set project to update |

---

## UI Components

### `CreateProjectModal`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/projects/CreateProjectModal.tsx`

Modal form for creating a new project.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `showModal` | `boolean` | Yes | Controls visibility |
| `showStepHeader` | `boolean` | No | Shows step indicator (default: false) |
| `onClose` | `() => void` | Yes | Close handler |
| `onProjectCreated` | `() => void` | Yes | Success callback |

**Form Fields:**
- **Name** (required): Text input
- **Description** (optional): Textarea
- **Types** (optional): Toggle chips for project types

---

### `UpdateProjectModal`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/projects/UpdateProjectModal.tsx`

Modal form for updating or deleting a project.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `showModal` | `boolean` | Yes | Controls visibility |
| `project` | `Project` | No | Project to update |
| `onClose` | `() => void` | Yes | Close handler |

**Features:**
- Edit name, description, and types
- Delete with confirmation dialog
- Pre-populated form fields

---

### `ProjectTile`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/projects/ProjectTile.tsx`

Displays a project in a tile format (used in sidebar and selection modal).

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `project` | `Project` | Yes | Project to display |
| `isSelected` | `boolean` | No | Selection indicator (default: false) |
| `showCreatedAt` | `boolean` | No | Show creation date (default: false) |
| `rightIcon` | `ReactNode` | No | Icon on the right |
| `onHoverRightIcon` | `ReactNode` | No | Icon shown on hover |
| `onClick` | `() => void` | No | Click handler |

**Display:**
- Avatar with first letter of project name
- Project name
- Creation date (based on props)
- Selection indicator dot when selected

---

### `ProjectSettingsCard`

**Location:** `front/app/components/settings/project/ProjectSettingsCard.tsx`

Card used in the Project Settings page to display and manage a single project.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `project` | `Project` | Yes | Project to display |

**Features:**
- Displays name, description (if set), type chips, and creation date
- Pencil icon → opens `UpdateProjectModal`
- Trash icon → opens `ConfirmDeleteDialog`, then calls `useDeleteProject`

---

### `ProjectSettings`

**Location:** `front/app/components/settings/ProjectSettings.tsx`

Settings page listing all of the user's projects. Accessible at `/settings/project`.

**Features:**
- Lists all projects via `useListPaginatedProjects()`
- "Nouveau Projet" button in the header → opens `CreateProjectModal` (local state)
- Shows shimmer skeletons while loading
- Each project rendered as a `ProjectSettingsCard`

---

## Integration with SideBar

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/sidebar/SideBar.tsx`

The SideBar component integrates all project features:

1. **Project Selector**: Shows focused project with `ProjectTile`
2. **Create Button**: Shown when no projects exist
3. **Select Modal**: `SelectItemModal` with project list
4. **Create Modal**: `CreateProjectModal` for new projects
5. **Update Modal**: `UpdateProjectModal` triggered from selection modal
6. **Navigation Links**: "Taches" and "Insights" links for built-in features

**Behavior:**
- Edit icon appears on hover in selection modal

---

## Data Flow

```
+-------------------------------------------------------------+
|                         SideBar                              |
|  +-----------------+  +-----------------+                    |
|  |  ProjectTile    |  | SelectItemModal |                    |
|  |  (focused)      |  |  (project list) |                    |
|  +--------+--------+  +--------+--------+                    |
|           |                    |                             |
|           v                    v                             |
|  +-----------------------------------------+                |
|  |         useSelectFocusedProject         |                |
|  |         useFocusProjectStore            |                |
|  +-----------------------------------------+                |
|                        |                                     |
|                        v                                     |
|  +-----------------------------------------+                |
|  |       useListPaginatedProjects          |                |
|  +-----------------------------------------+                |
|                        |                                     |
|                        v                                     |
|  +-----------------------------------------+                |
|  |            HTTP Client                   |                |
|  |         GET /api/projects               |                |
|  +-----------------------------------------+                |
+-------------------------------------------------------------+

+-----------------+     +-----------------+     +-----------------+
| CreateProject   |     | UpdateProject   |     | DeleteProject   |
|     Modal       |     |     Modal       |     |   (in Update)   |
+--------+--------+     +--------+--------+     +--------+--------+
         |                       |                       |
         v                       v                       v
+-----------------+     +-----------------+     +-----------------+
| useCreateProject|     | useUpdateProject|     | useDeleteProject|
+--------+--------+     +--------+--------+     +--------+--------+
         |                       |                       |
         v                       v                       v
+-------------------------------------------------------------+
|                      HTTP Client                             |
|  POST /api/projects  PATCH /api/projects/{uuid}  DELETE ... |
+-------------------------------------------------------------+
         |                       |                       |
         +-----------------------+-----------------------+
                                 |
                                 v
                    invalidateQueries(['projects'])
```

---
