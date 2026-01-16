# Coding Style Guidelines - Frontend (React/TypeScript)

## Overview

This document describes the coding conventions, patterns, and best practices used in the MakerFlow frontend application built with React, TypeScript, React Router, React Query, and Zustand.

---

## Project Structure

```
front/app/
├── components/           # Reusable UI components
│   ├── projects/         # Feature-specific components
│   ├── sidebar/          # Sidebar components
│   └── ui/               # Generic UI components
├── hooks/                # Custom React hooks
│   └── api/              # API-related hooks (React Query)
│       ├── modules/
│       ├── projects/
│       ├── userModules/
│       └── users/
├── models/               # Data models (classes)
│   ├── dtos/             # DTO interfaces
│   └── enums/            # TypeScript enums
├── modules/              # Feature modules (widgets)
│   └── todoList/
├── routes/               # Route components (pages)
├── services/             # External services
│   └── httpClient/       # Axios HTTP client
├── stores/               # Zustand state stores
│   ├── project/
│   └── sidebar/
└── utils/                # Utility functions
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CreateProjectModal.tsx`, `ProjectTile.tsx` |
| Hooks | camelCase with `use` prefix | `useCreateProject.ts`, `useCurrentUser.ts` |
| Stores | camelCase with `Store` suffix | `focusProjectStore.ts`, `sidebarStore.ts` |
| Models | PascalCase | `Project.ts`, `User.ts` |
| Enums | PascalCase | `ProjectType.ts`, `Color.ts` |
| Utils | camelCase | `dateFormatters.ts` |
| Query Keys | camelCase with `QueryKeys` suffix | `projectQueryKeys.ts`, `userQueryKeys.ts` |

### Components

| Type | Convention | Example |
|------|------------|---------|
| Page components | PascalCase noun | `Home`, `Library`, `Login` |
| Feature components | PascalCase descriptive | `CreateProjectModal`, `UpdateProjectModal` |
| UI components | PascalCase noun | `Button`, `Input`, `ModalOverlay` |
| Layout components | PascalCase with Layout suffix | `ProtectedLayout` |

### Hooks

| Type | Convention | Example |
|------|------------|---------|
| API mutations | `use{Action}{Resource}` | `useCreateProject`, `useDeleteProject` |
| API queries | `use{Action}{Resource}` or `use{Resource}` | `useListPaginatedProjects`, `useCurrentUser` |
| Selection hooks | `useSelect{Resource}` | `useSelectFocusedProject` |
| Utility hooks | `use{Description}` | `useAutoResizeTextarea` |

### Stores

| Type | Convention | Example |
|------|------------|---------|
| Store hook | `use{Domain}Store` | `useFocusProjectStore`, `useSidebarStore` |
| Modal stores | `use{Action}{Resource}ModalStore` | `useCreateProjectModalStore` |

### Variables

| Type | Convention | Example |
|------|------------|---------|
| Boolean state | `is{State}` or `has{State}` | `isLoading`, `isExpanded`, `hasMore` |
| Handlers | `handle{Action}` | `handleSubmit`, `handleSelect` |
| Callbacks | `on{Event}` | `onClick`, `onClose`, `onSelect` |
| Setters | `set{State}` | `setIsExpanded`, `setName` |

---

## Components

### Functional Component Structure

```tsx
import { useState } from "react";
import { Button } from "~/components/ui/Button";

interface ComponentNameProps {
    requiredProp: string;
    optionalProp?: boolean;
    onAction: () => void;
}

export default function ComponentName({ 
    requiredProp, 
    optionalProp = false, 
    onAction 
}: ComponentNameProps) {
    const [state, setState] = useState("");

    const handleAction = () => {
        // Logic here
        onAction();
    };

    return (
        <div className="...">
            {/* JSX */}
        </div>
    );
}
```

### Conventions

1. **Default export** for components
2. **Interface for props** defined above component
3. **Destructure props** in function signature
4. **Default values** in destructuring
5. **Handlers defined inside component** with `handle` prefix
6. **Early returns** for conditional rendering:
   ```tsx
   if (!showModal) return null;
   ```

### UI Component Pattern

```tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-heading-sm">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`... ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-body-sm text-danger">{error}</p>
                )}
            </div>
        );
    }
);
```

### Conventions for UI Components

1. **Named export** for UI components
2. **Use `forwardRef`** for form elements
3. **Extend native HTML attributes** interface
4. **Spread remaining props** with `{...props}`
5. **Allow className override** via props

---

## Models

### Class-based Models

```tsx
interface ProjectJSON {
    uuid: string;
    name: string;
    description: string;
    createdAt: string;
}

export class Project {
    constructor(
        public readonly uuid: string,
        public name: string,
        public description: string,
        public readonly createdAt: Date,
    ) { }

    static fromJSON(json: ProjectJSON): Project {
        return new Project(
            json.uuid,
            json.name,
            json.description,
            new Date(json.createdAt),
        );
    }

    toJSON(): ProjectJSON {
        return {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt.toISOString(),
        };
    }

    get isFinished(): boolean {
        return this.finishedAt !== undefined;
    }
}
```

### Conventions

1. **Interface for JSON shape** (API response)
2. **Class with constructor** for domain model
3. **`readonly` for immutable properties** (uuid, createdAt)
4. **Static `fromJSON` factory method** for deserialization
5. **`toJSON` method** for serialization
6. **Computed getters** for derived properties
7. **Parse dates** from ISO strings in `fromJSON`

---

## DTOs

DTOs (Data Transfer Objects) are **classes** used to represent data from API responses or other external sources.

### Class-based DTO

```tsx
import { User } from '../User';

interface AuthResponseJSON {
    token: string;
    user: any;
}

export class AuthResponseDTO {
    constructor(
        public readonly token: string,
        public readonly user: User,
    ) {}

    static fromJSON(json: AuthResponseJSON): AuthResponseDTO {
        return new AuthResponseDTO(
            json.token,
            User.fromJSON(json.user),
        );
    }
}
```

### DTO with Custom Factory Method

```tsx
export class OAuthCallbackReponseDTO {
    constructor(
        public readonly status: OAuthCallbackStatus,
        public readonly provider: IntegrationProvider,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("provider") as IntegrationProvider,
            (params.get("errorCode") as OAuthErrorCode) ?? undefined,
            params.get("integrationUuid") ?? undefined,
        );
    }
}
```

### Grouped DTO Pattern

When the API returns items grouped by an enum (e.g., tasks by status, integrations by provider), create a dedicated DTO class:

```tsx
import type { IntegrationProvider } from "../enums/IntegrationProvider";
import { Integration, type IntegrationJSON } from "../Integration";

export interface IntegrationsGroupedByProviderDTOJSON {
    provider: IntegrationProvider;
    integrations: IntegrationJSON[];
}

export class IntegrationsGroupedByProviderDTO {
    constructor(
        public readonly provider: IntegrationProvider,
        public integrations: Integration[],
    ) { }

    static fromJSON(json: IntegrationsGroupedByProviderDTOJSON): IntegrationsGroupedByProviderDTO {
        return new IntegrationsGroupedByProviderDTO(
            json.provider,
            json.integrations.map(integration => Integration.fromJSON(integration)),
        );
    }
}
```

**Usage in hooks:**

```tsx
const res = await httpClient.get<IntegrationsGroupedByProviderDTOJSON[]>(`/integrations`, {
    params: { userModuleUuid }
});
return res.data.map((json) => IntegrationsGroupedByProviderDTO.fromJSON(json));
```

### Conventions

1. **DTOs are classes**, not interfaces
2. **`readonly` for all properties**
3. **Static factory method** for parsing (`fromJSON`, `fromSearchParams`, etc.)
4. **Factory method name** describes the data source
5. **Transform nested objects** using their respective `fromJSON` methods
6. **Export JSON interface** from model files for use in DTOs
7. **Grouped DTOs** follow naming: `{Resource}GroupedBy{Enum}DTO`

---

## Enums

### Structure

```tsx
export enum ProjectType {
    Saas = 'saas',
    ContentCreation = 'content_creation',
    MobileApp = 'mobile_app',
}

export const projectTypeToFrenchTranslation: Record<ProjectType, string> = {
    [ProjectType.Saas]: "SaaS",
    [ProjectType.ContentCreation]: "Création de contenu",
    [ProjectType.MobileApp]: "Application mobile",
};
```

### Conventions

1. **String-backed enums** matching backend values
2. **PascalCase** for enum names and keys
3. **snake_case** for string values
4. **Translation records** for display labels
5. **Mapping records** for styling (colors, classes)

---

## API Hooks (React Query)

### Query Hook

```tsx
import { useQuery } from "@tanstack/react-query";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

export function useListPaginatedProjects(limit: number = 10) {
    const query = useQuery({
        queryKey: projectQueryKeys.list(1, limit),
        queryFn: async () => {
            const res = await httpClient.get(`/projects`, {
                params: { page: 1, limit }
            });
            return res.data.map((json: any) => Project.fromJSON(json));
        },
    });

    return {
        projects: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
```

### Mutation Hook

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

interface CreateProjectData {
    name: string;
    description: string;
    types: ProjectType[];
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateProjectData) => {
            const res = await httpClient.post('/projects', {
                name: data.name,
                description: data.description,
                types: data.types
            });
            return Project.fromJSON(res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
        },
    });

    return {
        createProject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
```

### Query Keys

```tsx
export const projectQueryKeys = {
    all: ['projects'] as const,
    list: (page: number, limit: number) => [...projectQueryKeys.all, 'list', page, limit] as const,
    userModules: (projectUuid: string) => [...projectQueryKeys.all, 'userModules', projectUuid] as const,
};
```

### Conventions

1. **Centralized query keys** in `{resource}QueryKeys.ts`
2. **Use `as const`** for type safety
3. **Invalidate on mutations** using `queryClient.invalidateQueries`
4. **Return object** with named properties (not the raw query/mutation)
5. **Default empty array** for list queries: `query.data ?? []`
6. **Transform API response** using model's `fromJSON`
7. **Interface for mutation data** defined above hook
8. **No callbacks in hooks** - return state values instead, let components react with `useEffect` if needed

### OAuth Hooks

OAuth hooks are special because success/error comes from popup `postMessage`, not from the HTTP request. They follow the same state-based pattern.

```tsx
// hooks/api/integrations/useAuthorizeInstagram.ts
export function useAuthorizeInstagram() {
    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        provider: IntegrationProvider.Instagram,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.get<AuthorizeInstagramResponse>('/integrations/instagram/authorize');
            return res.data;
        },
        onSuccess: (data) => {
            openPopup(data.authorization_url);
        },
    });

    const reset = useCallback(() => {
        mutation.reset();
        resetOAuth();
    }, [mutation, resetOAuth]);

    return {
        authorize: mutation.mutate,
        isPending: mutation.isPending || isOpen,
        integrationUuid,
        oauthError: oauthError ?? (mutation.error ? OAuthErrorCode.TokenExchangeFailed : null),
        error: mutation.error,
        reset,
    };
}
```

### OAuth Hook Conventions

1. **Return state values** (`integrationUuid`, `oauthError`) instead of callbacks
2. **Combine pending states** - `isPending` includes both mutation and popup open state
3. **Combine errors** - `oauthError` includes both popup errors and mutation errors
4. **Single reset function** - resets both mutation and OAuth state
5. **Use `useOAuthPopup`** utility hook for popup management

---

## Zustand Stores

### Basic Store

```tsx
import { create } from 'zustand';

type SidebarState = {
    isExpanded: boolean;
};

type SidebarAction = {
    setIsExpanded: (isExpanded: boolean) => void;
};

export const useSidebarStore = create<SidebarState & SidebarAction>((set) => ({
    isExpanded: false,
    setIsExpanded: (isExpanded) => set({ isExpanded }),
}));
```

### Store with localStorage

```tsx
import { create } from 'zustand';

const LOCAL_STORAGE_KEY = "app:project:focused";

type FocusProjectState = {
    focusedProjectUuid: string | null;
};

type FocusProjectAction = {
    setFocusedProjectUuid: (uuid: string | null) => void;
};

export const useFocusProjectStore = create<FocusProjectState & FocusProjectAction>((set) => ({
    focusedProjectUuid: typeof window !== "undefined" 
        ? localStorage.getItem(LOCAL_STORAGE_KEY) 
        : null,

    setFocusedProjectUuid: (uuid) => {
        if (typeof window !== "undefined" && uuid) {
            localStorage.setItem(LOCAL_STORAGE_KEY, uuid);
        }
        set({ focusedProjectUuid: uuid });
    },
}));
```

### Conventions

1. **Separate State and Action types**
2. **Combine types** with `&` in `create<State & Action>`
3. **localStorage key pattern**: `app:{domain}:{key}`
4. **Check `typeof window`** for SSR safety
5. **Simple setters** for state updates

---

## HTTP Client

### Structure

```tsx
import axios from "axios";
import { CustomHttpException } from "./customHttpExceptions";

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
    withCredentials: true,
    headers: {
        "X-Timezone": "Europe/Paris",
    }
});

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Transform to custom exceptions
        return Promise.reject(customException);
    }
);
```

### Custom Exceptions

```tsx
export class CustomHttpException {
    constructor(
        public statusCode: number,
        public errorMessage: string,
        public data?: any,
    ) { }
}

export class NotFoundException extends CustomHttpException {
    constructor(message: string, data?: any) {
        super(404, message, data);
    }
}
```

### Conventions

1. **Single axios instance** exported as `httpClient`
2. **Base URL from environment** variable
3. **Credentials included** for cookie-based auth
4. **Response interceptor** transforms errors to custom exceptions
5. **Custom exception classes** for each HTTP status

---

## Routes

### Route Configuration

```tsx
import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // Public routes
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

    // Protected routes
    layout("routes/protected.tsx", [
        index("routes/home.tsx"),
        route("library", "routes/library.tsx"),
    ]),
] satisfies RouteConfig;
```

### Protected Layout

```tsx
export default function ProtectedLayout() {
    const { user, isLoading } = useCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, isLoading, navigate]);

    if (user) {
        return <Outlet />;
    }

    return <LoadingSpinner />;
}
```

### Conventions

1. **Layout components** for shared UI (sidebar, auth checks)
2. **Protected routes** wrapped in auth-checking layout
3. **Redirect to login** if not authenticated
4. **Show loading** while checking auth state

---

## Utility Functions

### Structure

```tsx
/**
 * Formats a date to French locale with abbreviated month: "01 janv. 2024"
 */
export function formatToFrenchDateShort(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
}
```

### Conventions

1. **JSDoc comments** for documentation
2. **Pure functions** - no side effects
3. **Explicit return types**
4. **Grouped by domain** in utils folder

---

## Import Aliases

Use `~` alias for app-relative imports:

```tsx
import { Button } from "~/components/ui/Button";
import { useCreateProject } from "~/hooks/api/projects/useCreateProject";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
```

---

## Styling

### Tailwind Classes

1. **Use Tailwind classes** exclusively (no raw CSS)
2. **Use custom typography classes**: `text-heading-lg`, `text-body-sm`
3. **Use custom color variables**: `text-primary`, `bg-dark`, `border-light-gray`
4. **Conditional classes** with template literals:
   ```tsx
   className={`base-class ${condition ? 'active-class' : 'inactive-class'}`}
   ```

### Component Styling Pattern

```tsx
<div className={`
    flex flex-row justify-between items-center
    hover:bg-light-gray cursor-pointer
    rounded-md p-2
    ${isSelected ? 'bg-primary' : ''}
`}>
```

---

## Form Handling

### Controlled Components

```tsx
const [name, setName] = useState("");
const [description, setDescription] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject({ name, description });
    resetForm();
    onClose();
};

const resetForm = () => {
    setName("");
    setDescription("");
};

return (
    <form onSubmit={handleSubmit}>
        <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
        />
        <Button type="submit" isLoading={isPending}>
            Submit
        </Button>
    </form>
);
```

### Conventions

1. **Controlled inputs** with useState
2. **Prevent default** on form submit
3. **Reset form** after successful submission
4. **Disable button** while loading
5. **Show loading state** on submit button

---

## Feature Modules

Feature modules are self-contained packages that encapsulate all code related to a specific feature (e.g., TodoList). They mirror the backend module structure and are rendered as widgets on the dashboard.

### Module Structure

```
front/app/modules/
├── registry.tsx              # Module registry and widget lookup
└── todoList/                 # Example module
    ├── components/           # Module-specific components
    │   ├── TodoListDashboardView.tsx    # Main widget entry point
    │   ├── TodoListDashboardContent.tsx # Dashboard content
    │   ├── todoLists/        # Sub-feature components
    │   ├── todoListTasks/    # Sub-feature components
    │   └── todoListTags/     # Sub-feature components
    ├── dtos/                 # Module-specific DTOs
    ├── hooks/                # Module-specific hooks
    │   └── api/              # API hooks for this module
    │       ├── todoLists/
    │       ├── todoListTasks/
    │       └── todoListTags/
    ├── models/               # Module-specific models
    │   ├── TodoList.ts
    │   ├── TodoListTask.ts
    │   ├── TodoListTag.ts
    │   └── enums/
    └── stores/               # Module-specific Zustand stores
        ├── todoLists/
        └── todoListTasks/
```

### Module Registry

The registry maps module identifiers to their widget components:

```tsx
import type { ComponentType } from "react";
import { ModuleIdentifier } from "~/models/enums/ModuleIdentifier";
import TodoListDashboardView from "./todoList/components/TodoListDashboardView";

export interface ModuleWidgetProps {
    userModuleUuid: string;
}

type ModuleWidgetComponent = ComponentType<ModuleWidgetProps>;

const moduleRegistry: Record<ModuleIdentifier, ModuleWidgetComponent | null> = {
    [ModuleIdentifier.TodoList]: TodoListDashboardView,
    [ModuleIdentifier.GithubStats]: null,  // Not implemented yet
    [ModuleIdentifier.Stripe]: null,       // Not implemented yet
};

export function getModuleWidget(identifier: ModuleIdentifier): ModuleWidgetComponent | null {
    return moduleRegistry[identifier] ?? null;
}

export function hasModuleWidget(identifier: ModuleIdentifier): boolean {
    return moduleRegistry[identifier] !== null;
}
```

### Module Widget Entry Point

Each module has a main dashboard view component that receives `userModuleUuid`:

```tsx
import type { ModuleWidgetProps } from "~/modules/registry";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists } = useListTodoLists({ userModuleUuid });
    const { focusedTodoListUuid } = useSelectFocusedTodoList({ todoLists });

    const focusedTodoList = todoLists.find((tl) => tl.uuid === focusedTodoListUuid) ?? null;

    if (todoLists.length === 0 || !focusedTodoList) {
        return <CreateTodoListModal userModuleUuid={userModuleUuid} />;
    }

    return <TodoListDashboardContent focusedTodoList={focusedTodoList} />;
}
```

### Module Usage in Routes

Modules are rendered dynamically based on user's enabled modules:

```tsx
export default function Home() {
    const { userModules } = useListProjectUserModules(focusedProject?.uuid);

    return (
        <div className="flex flex-row flex-wrap">
            {userModules
                .filter((um) => hasModuleWidget(um.module.moduleIdentifier))
                .map((userModule) => {
                    const Widget = getModuleWidget(userModule.module.moduleIdentifier);
                    if (!Widget) return null;
                    return <Widget key={userModule.uuid} userModuleUuid={userModule.uuid} />;
                })}
        </div>
    );
}
```

### Module Conventions

1. **Self-contained** - all module code lives in `modules/{moduleName}/`
2. **Own models** - module-specific models in `modules/{moduleName}/models/`
3. **Own hooks** - module-specific API hooks in `modules/{moduleName}/hooks/api/`
4. **Own stores** - module-specific Zustand stores in `modules/{moduleName}/stores/`
5. **Own components** - module-specific components in `modules/{moduleName}/components/`
6. **Widget entry point** - `{ModuleName}DashboardView.tsx` implements `ModuleWidgetProps`
7. **Register in registry** - add widget to `moduleRegistry` in `registry.tsx`
8. **Use relative imports** within module, `~` alias for app-level imports
9. **API routes** follow pattern: `/modules/{module-name}/...`
10. **localStorage keys** follow pattern: `app:{module-name}:{key}`

### Module Imports

Within a module, use relative imports for module-specific code:

```tsx
// Inside modules/todoList/components/TodoListDashboardView.tsx
import { useListTodoLists } from "../hooks/api/todoLists/useListTodoLists";
import { TodoList } from "../models/TodoList";
import { useFocusTodoListStore } from "../stores/todoLists/focusTodoListStore";

// For app-level imports, use ~ alias
import { httpClient } from "~/services/httpClient/httpClient";
import { ModalOverlay } from "~/components/ui/ModalOverlay";
```

---

## Best Practices

1. **Use TypeScript strictly** - avoid `any` when possible
2. **Prefer named exports** for hooks and utilities
3. **Prefer default exports** for components
4. **Use `forwardRef`** for form input components
5. **Invalidate queries** after mutations
6. **Transform API data** to domain models
7. **Separate state and actions** in Zustand stores
8. **Use custom exceptions** for error handling
9. **Keep components focused** - extract logic to hooks
10. **Use early returns** for conditional rendering
11. **Destructure props** in function signature
12. **Use template literals** for conditional classes
