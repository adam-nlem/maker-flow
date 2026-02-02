# Module & UserModule Feature - Frontend Documentation

## Overview

The Module system enables users to add functionality to their projects through modular widgets. The frontend handles:

- Displaying available modules in a library
- Adding modules to projects (creating UserModules)
- Rendering module widgets on the dashboard
- Managing module-specific data through feature modules

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Dashboard                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ TodoList Widget │  │ GithubStats     │  │ Stripe Widget   │  │
│  │ (userModuleUuid)│  │ Widget          │  │                 │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Module Registry                             │
│  moduleRegistry: Record<ModuleIdentifier, ModuleRegistryItem>    │
│  - getDashboardView(identifier) → Component                      │
│  - getPageView(identifier) → Component (may be a router)         │
│  - getRouter(identifier) → Component                             │
│  - hasDashboardView(identifier) → boolean                        │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Feature Modules                               │
│  modules/todoList/  - components, hooks, models, stores          │
│  modules/stripe/    - (future)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Module

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/models/Module.ts`

Represents a module template available in the system.

```typescript
interface ModuleJSON {
    uuid: string;
    title: string;
    isActive: boolean;
    isPremium: boolean;
    createdAt: string;
    updatedAt: string;
    description?: string;
    moduleIdentifier: ModuleIdentifier;
}

class Module {
    constructor(
        public readonly uuid: string,
        public title: string,
        public isActive: boolean,
        public isPremium: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public moduleIdentifier: ModuleIdentifier,
        public description?: string,
    ) { }

    static fromJSON(json: ModuleJSON): Module;
    toJSON(): ModuleJSON;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Unique identifier |
| `title` | `string` | Display name |
| `isActive` | `boolean` | Whether module is available |
| `isPremium` | `boolean` | Requires premium subscription |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |
| `moduleIdentifier` | `ModuleIdentifier` | Enum identifier for widget lookup |
| `description` | `string?` | Optional description |

---

### UserModule

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/models/UserModule.ts`

Represents a user's instance of a module within a project.

```typescript
interface UserModuleJSON {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    xIndex: number;
    yIndex: number;
    size: ModuleSize;
    isActive: boolean;
    isHidden: boolean;
    module: ModuleJSON;
}

class UserModule {
    constructor(
        public readonly uuid: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public xIndex: number,
        public yIndex: number,
        public size: ModuleSize,
        public isActive: boolean,
        public isHidden: boolean,
        public module: Module,
    ) { }

    static fromJSON(json: UserModuleJSON): UserModule;
    toJSON(): UserModuleJSON;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Unique identifier |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |
| `xIndex` | `number` | Horizontal grid position |
| `yIndex` | `number` | Vertical grid position |
| `size` | `ModuleSize` | Widget size (small/medium/large) |
| `isActive` | `boolean` | Whether instance is active |
| `isHidden` | `boolean` | Whether hidden from view |
| `module` | `Module` | The module template (embedded) |

---

## Enums

### ModuleIdentifier

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/models/enums/ModuleIdentifier.ts`

```typescript
enum ModuleIdentifier {
    GithubStats = 'github_stats',
    TodoList = 'todo_list',
    Stripe = 'stripe',
    SocialAnalytics = 'social_analytics',
}
```

Used to:
- Match backend module identifiers
- Look up widget components in the registry
- Route to correct feature module implementation

---

### ModuleSize

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/models/enums/ModuleSize.ts`

```typescript
enum ModuleSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}
```

Defines the display size of module widgets on the dashboard grid.

---

## API Hooks

### Module Hooks

#### `useListPaginatedModules`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/modules/useListPaginatedModules.ts`

Fetches a paginated list of all available modules (for the library).

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `10` | Items per page |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `modules` | `Module[]` | All loaded modules |
| `isLoading` | `boolean` | Initial loading state |
| `isLoadingMore` | `boolean` | Loading more pages |
| `hasMore` | `boolean` | More pages available |
| `error` | `Error \| null` | Error if any |
| `listMore` | `() => Promise<void>` | Load next page |

**Usage:**

```tsx
const { modules, isLoading, hasMore, listMore } = useListPaginatedModules(10);
```

---

#### `useShowModuleIcon`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/modules/useShowModuleIcon.ts`

Fetches the icon for a specific module.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `moduleIdentifier` | `string?` | The module's identifier |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `iconUrl` | `string \| null` | Blob URL for the icon |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |

**Notes:**
- Returns a blob URL created from the SVG response
- Uses `staleTime: Infinity` to cache icons permanently
- Query is disabled if `moduleIdentifier` is undefined

---

#### Query Keys

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/modules/moduleQueryKeys.ts`

```typescript
const moduleQueryKeys = {
    all: ['modules'] as const,
    list: (page: number, limit: number) => [...moduleQueryKeys.all, 'list', page, limit] as const,
    icon: (moduleIdentifier: string) => [...moduleQueryKeys.all, 'icon', moduleIdentifier] as const,
}
```

---

### UserModule Hooks

#### `useCreateUserModule`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/userModules/useCreateUserModule.ts`

Adds a module to a project.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `createUserModule` | `(data) => Promise<UserModule>` | Create mutation |
| `isPending` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |
| `reset` | `() => void` | Reset mutation state |

**Mutation Data:**

```typescript
interface CreateUserModuleData {
    moduleUuid: string;
    projectUuid: string;
}
```

**Behavior:**
- On success, invalidates `projectQueryKeys.userModules(projectUuid)` to refresh the dashboard

**Usage:**

```tsx
const { createUserModule, isPending } = useCreateUserModule();

await createUserModule({
    moduleUuid: module.uuid,
    projectUuid: project.uuid,
});
```

---

#### `useListProjectUserModules`

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/hooks/api/projects/useListProjectUserModules.ts`

Fetches all user modules for a specific project.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `projectUuid` | `string?` | UUID of the project |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `userModules` | `UserModule[]` | User modules for the project |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |

**Notes:**
- Query is disabled if `projectUuid` is undefined
- Returns empty array while loading

**Usage:**

```tsx
const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);
```

---

## Module Registry

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/modules/registry.tsx`

The registry maps `ModuleIdentifier` values to their widget component implementations.

### Interface

```typescript
interface ModuleWidgetProps {
    userModuleUuid: string;
}

type ModuleWidgetComponent = ComponentType<ModuleWidgetProps>;
```

All module widgets receive `userModuleUuid` as their only prop. This UUID is used to:
- Identify the specific user module instance
- Fetch module-specific data (e.g., todo lists for this user module)

### Registry Structure

```typescript
interface ModuleRegistryItem {
    dashboardView: ModuleWidgetComponent;  // Widget for the dashboard grid
    pageView: ModuleWidgetComponent;       // Full-page view (may be a router)
    router: ModuleWidgetComponent;         // Module router for sub-routes
}

const moduleRegistry: Record<ModuleIdentifier, ModuleRegistryItem | null> = {
    [ModuleIdentifier.TodoList]: {
        dashboardView: TodoListDashboardView,
        pageView: TodoListDashboardView,
        router: TodoListDashboardView,
    },
    [ModuleIdentifier.GithubStats]: null,
    [ModuleIdentifier.Stripe]: null,
    [ModuleIdentifier.SocialAnalytics]: {
        dashboardView: SocialAnalyticsDashboardView,
        pageView: SocialAnalyticsRouter,      // Module router handles sub-routes
        router: SocialAnalyticsRouter,
    },
};
```

### Functions

#### `getDashboardView`

```typescript
function getDashboardView(identifier: ModuleIdentifier): ModuleWidgetComponent | null
```

Returns the dashboard widget component for a module.

#### `getPageView`

```typescript
function getPageView(identifier: ModuleIdentifier): ModuleWidgetComponent | null
```

Returns the full-page component for a module. For modules with sub-routes, this returns the module router.

#### `getRouter`

```typescript
function getRouter(identifier: ModuleIdentifier): ModuleWidgetComponent | null
```

Returns the module router component.

#### `hasDashboardView`

```typescript
function hasDashboardView(identifier: ModuleIdentifier): boolean
```

Returns `true` if the module has a dashboard widget implementation.

---

## Dashboard Rendering

### How Widgets Are Rendered

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/routes/home.tsx`

```tsx
export default function Home() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);

    return (
        <div className="w-full pl-16 flex flex-row flex-wrap">
            {userModules
                .filter((um) => hasDashboardView(um.module.moduleIdentifier))
                .map((userModule) => {
                    const Widget = getDashboardView(userModule.module.moduleIdentifier);
                    if (!Widget) return null;
                    return <Widget key={userModule.uuid} userModuleUuid={userModule.uuid} />;
                })}
        </div>
    );
}
```

### Rendering Flow

```
1. Load focused project
2. Fetch userModules for focused project
3. Filter to only modules with widget implementations
4. For each userModule:
   a. Look up widget component via registry
   b. Render widget with userModuleUuid prop
5. Widget uses userModuleUuid to fetch its specific data
```

---

## Feature Module Structure

Each module has its own self-contained folder with all related code. Modules with multiple pages include a router and a `pages/` folder.

### Example: SocialAnalytics Module (multi-page with router)

```
front/app/modules/socialAnalytics/
├── SocialAnalyticsRouter.tsx          # Module router (registered as pageView/router)
├── pages/
│   └── SocialAnalyticsPostDetailPage.tsx  # Page component (extracts params)
├── components/
│   ├── SocialAnalyticsPageView.tsx    # Main page view
│   ├── SocialAnalyticsDashboardView.tsx  # Dashboard widget
│   └── posts/                         # Post-related components
├── dtos/                              # Module-specific DTOs
├── hooks/api/                         # API hooks
├── models/                            # Module-specific models
└── stores/                            # Module-specific Zustand stores
```

### Example: TodoList Module (single page)

```
front/app/modules/todoList/
├── components/
│   ├── TodoListDashboardView.tsx      # Widget entry point
│   ├── TodoListDashboardContent.tsx   # Main content
│   ├── todoLists/                     # TodoList CRUD components
│   ├── todoListTasks/                 # Task components
│   └── todoListTags/                  # Tag components
├── dtos/                              # Module-specific DTOs
├── hooks/
│   └── api/
│       ├── todoLists/                 # TodoList API hooks
│       ├── todoListTasks/             # Task API hooks
│       └── todoListTags/              # Tag API hooks
├── models/
│   ├── TodoList.ts
│   ├── TodoListTask.ts
│   ├── TodoListTag.ts
│   └── enums/
└── stores/
    ├── todoLists/                     # TodoList stores
    └── todoListTasks/                 # Task stores
```

### Widget Entry Point Pattern

```tsx
// modules/todoList/components/TodoListDashboardView.tsx
import type { ModuleWidgetProps } from "~/modules/registry";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    // Use userModuleUuid to fetch module-specific data
    const { todoLists } = useListTodoLists({ userModuleUuid });
    const { focusedTodoListUuid } = useSelectFocusedTodoList({ todoLists });

    const focusedTodoList = todoLists.find((tl) => tl.uuid === focusedTodoListUuid) ?? null;

    // Handle empty state
    if (todoLists.length === 0 || !focusedTodoList) {
        return <CreateTodoListModal userModuleUuid={userModuleUuid} />;
    }

    // Render main content
    return <TodoListDashboardContent focusedTodoList={focusedTodoList} />;
}
```

---

## Data Flow

### Adding a Module to a Project

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Library   │────▶│ useCreateUser    │────▶│ POST /api/      │
│   (select   │     │ Module           │     │ user-modules    │
│   module)   │     └──────────────────┘     └─────────────────┘
└─────────────┘              │                        │
                             ▼                        ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ Invalidate       │◀────│ UserModule      │
                    │ userModules      │     │ created         │
                    │ query            │     └─────────────────┘
                    └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Dashboard        │
                    │ re-renders with  │
                    │ new widget       │
                    └──────────────────┘
```

### Loading Dashboard Widgets

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Home route  │────▶│ useListProject   │────▶│ GET /api/       │
│ loads       │     │ UserModules      │     │ projects/{uuid} │
└─────────────┘     └──────────────────┘     │ /user-modules   │
                             │               └─────────────────┘
                             ▼
                    ┌──────────────────┐
                    │ For each         │
                    │ userModule:      │
                    │ - getDashboardView│
                    │ - render Widget   │
                    └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Widget fetches   │
                    │ its own data     │
                    │ using            │
                    │ userModuleUuid   │
                    └──────────────────┘
```

---

## Adding a New Module

To add a new module to the system:

### 1. Backend

1. Add new case to `ModuleIdentifier` enum
2. Create database entry for the new Module
3. Create feature module folder in `src/Module/{ModuleName}/`
4. Implement controllers, entities, DTOs, repositories

### 2. Frontend

1. Add new case to `ModuleIdentifier` enum in `models/enums/ModuleIdentifier.ts`
2. Create feature module folder in `modules/{moduleName}/`
3. Create widget entry point: `{ModuleName}DashboardView.tsx`
4. Implement `ModuleWidgetProps` interface
5. If the module has multiple pages, create a `{ModuleName}Router.tsx` at the module root with `<Routes>` / `<Route>` for sub-routing, and put page components in `modules/{moduleName}/pages/`
6. Register in `registry.tsx`:

```typescript
import NewModuleDashboardView from "./newModule/components/NewModuleDashboardView";
import NewModuleRouter from "./newModule/NewModuleRouter";

const moduleRegistry: Record<ModuleIdentifier, ModuleRegistryItem | null> = {
    // ...
    [ModuleIdentifier.NewModule]: {
        dashboardView: NewModuleDashboardView,
        pageView: NewModuleRouter,     // or NewModuleDashboardView if single page
        router: NewModuleRouter,       // or NewModuleDashboardView if single page
    },
};
```

---

## Best Practices

1. **Use `userModuleUuid`** to scope all module data - never use just `moduleIdentifier`
2. **Implement `ModuleWidgetProps`** interface for all widget entry points
3. **Keep modules self-contained** - all module code in `modules/{name}/`
4. **Use relative imports** within modules, `~` alias for app-level code
5. **Handle empty states** in widget entry points
6. **Invalidate queries** after creating user modules
7. **Check `hasModuleWidget`** before rendering to avoid null widgets
8. **Cache icons** with `staleTime: Infinity` since they rarely change
