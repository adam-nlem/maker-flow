# Coding Style Guidelines - Frontend (React/TypeScript)

## Overview

This document describes the coding conventions, patterns, and best practices used in the MakerFlow frontend application built with React, TypeScript, React Router, React Query, and Zustand.

---

## Project Structure

```
front/src/
├── components/           # Reusable UI components
│   ├── agency/           # Agency-shell-only — everything an agency user sees
│   │   ├── AgencyShellLayout.tsx
│   │   ├── AgencyLogo.tsx
│   │   ├── sidebar/      # DesktopSidebar, MobileSidebar (composed inside the shared shells)
│   │   ├── topbar/       # AgencyTopBar + agencyTopBarActions registry
│   │   ├── home/         # Agency-only home widgets (HomeScriptsPanel, HomeScriptTile, …)
│   │   ├── projects/     # Project feature components
│   │   ├── scripts/      # Scripts + nested calendar/, chat/, parts/, hookTemplates/
│   │   ├── reviews/   # Review workflow
│   │   ├── tasks/        # Todo lists / tasks
│   │   └── settings/     # Agency settings (AgencySettings, SubscriptionSettings, ProjectsSettings + nested agency/, subscription/, project/)
│   ├── client/           # Client-shell-only — everything a client sees
│   │   ├── ClientShellLayout.tsx
│   │   ├── ClientPortalLockedView.tsx
│   │   ├── sidebar/      # ClientDesktopSidebar, ClientMobileSidebar
│   │   └── topbar/       # ClientTopBar + clientTopBarActions registry
│   ├── auth/             # Shared — RootRedirect, AuthStepLayout, login/register/OTP forms
│   ├── onboarding/       # Shared onboarding steps (both roles flow through)
│   ├── welcome/          # Shared pre-login welcome steps
│   ├── prelaunch/        # Shared prelaunch (public)
│   ├── invitations/      # Shared invite setup (public)
│   ├── home/             # Shared home widgets (HomeOverviewCards, HomeTopPosts, …)
│   ├── contents/         # Shared — used by both /agency/contents and /client/contents
│   ├── integrations/     # Shared integration tiles + login modal
│   ├── insights/         # Shared insight tiles
│   ├── settings/         # Shared settings only (SettingsPageView, GeneralSettings, LanguageSwitcher)
│   ├── sidebar/          # Shared shells + tiles (SidebarShell, MobileSidebarShell, IconRailTile, IdentityTile, IdentityPopover)
│   ├── topbar/           # Shared shell (TopBarShell)
│   └── ui/               # Generic UI primitives
├── hooks/                # Custom React hooks (organized by resource, not role — many hooks are shared)
│   └── api/              # API-related hooks (React Query)
├── models/               # Data models (classes)
│   ├── dtos/             # DTO interfaces
│   └── enums/            # TypeScript enums
├── routes/               # Route components (pages)
│   ├── agency/           # Pages under /agency/*
│   ├── client/           # Pages under /client/*
│   ├── (flat files)      # Public/auth pages + ProtectedLayout/PrelaunchGuardLayout
│   └── routePaths.ts     # Centralised path constants
├── services/             # External services
│   └── httpClient/       # Axios HTTP client
├── stores/               # Zustand state stores (organized by domain, not role)
└── utils/                # Utility functions
```

**Component-folder rule of thumb**: anything imported only by `/agency/*` routes lives under `components/agency/`; anything imported only by `/client/*` routes lives under `components/client/`. Everything else stays at the top level of `components/` (shared by both shells, public/auth routes, or onboarding).

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CreateProjectModal.tsx`, `ProjectTile.tsx` |
| Hooks | camelCase with `use` prefix | `useCreateProject.ts`, `useCurrentUser.ts` |
| Stores | camelCase with `Store` suffix | `focusProjectStore.ts`, `calendarStore.ts` |
| Models | PascalCase | `Project.ts`, `User.ts` |
| Enums | PascalCase | `ProjectType.ts`, `Color.ts` |
| Utils | camelCase | `dateFormatters.ts` |
| Query Keys | camelCase with `QueryKeys` suffix | `projectQueryKeys.ts`, `userQueryKeys.ts` |

### Components

| Type | Convention | Example |
|------|------------|---------|
| Page components | PascalCase noun | `Home`, `Login`, `Insights` |
| Feature components | PascalCase descriptive | `CreateProjectModal`, `UpdateProjectModal` |
| UI components | PascalCase noun | `Button`, `Input`, `ModalOverlay` |
| Layout components | PascalCase with Layout suffix | `ProtectedLayout` |

### Hooks

| Type | Convention | Example |
|------|------------|---------|
| API mutations | `use{Action}{Resource}` | `useCreateProject`, `useDeleteProject` |
| API queries | `use{Action}{Resource}` or `use{Resource}` | `useListPaginatedProjects`, `useCurrentUser` |
| Selection hooks | `useSelect{Resource}` | `useSelectFocusedProject` |
| Utility hooks | `use{Description}` | `useAutoResizeTextarea`, `useInfiniteScroll` |

### Stores

| Type | Convention | Example |
|------|------------|---------|
| Store hook | `use{Domain}Store` | `useFocusProjectStore`, `useCalendarStore` |
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
        public readonly platform: Platform,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("platform") as Platform,
            (params.get("errorCode") as OAuthErrorCode) ?? undefined,
            params.get("integrationUuid") ?? undefined,
        );
    }
}
```

### Grouped DTO Pattern

When the API returns items grouped by an enum (e.g., tasks by status, integrations by platform), create a dedicated DTO class:

```tsx
import type { Platform } from "../enums/Platform";
import { Integration, type IntegrationJSON } from "../Integration";

export interface IntegrationsGroupedByPlatformDTOJSON {
    platform: Platform;
    integrations: IntegrationJSON[];
}

export class IntegrationsGroupedByPlatformDTO {
    constructor(
        public readonly platform: Platform,
        public integrations: Integration[],
    ) { }

    static fromJSON(json: IntegrationsGroupedByPlatformDTOJSON): IntegrationsGroupedByPlatformDTO {
        return new IntegrationsGroupedByPlatformDTO(
            json.platform,
            json.integrations.map(integration => Integration.fromJSON(integration)),
        );
    }
}
```

**Usage in hooks:**

```tsx
const res = await httpClient.get<IntegrationsGroupedByPlatformDTOJSON[]>(`/integrations`, {
    params: { projectUuid }
});
return res.data.map((json) => IntegrationsGroupedByPlatformDTO.fromJSON(json));
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
    [ProjectType.ContentCreation]: "Cr\u00e9ation de contenu",
    [ProjectType.MobileApp]: "Application mobile",
};
```

### Conventions

1. **String-backed enums** matching backend values
2. **PascalCase** for enum names and keys
3. **snake_case** for string values
4. **Translation records** for display labels
5. **Mapping records** for styling (colors, classes)
6. **Options constant** for iteration — every enum must export a pre-built array:
   ```ts
   export const projectTypeOptions = Object.values(ProjectType);
   ```
   Components must use this constant instead of calling `Object.values()` inline:
   ```tsx
   // Good
   {projectTypeOptions.map((type) => ...)}

   // Bad
   {Object.values(ProjectType).map((type) => ...)}
   ```
7. **Icon map** (when applicable) — enums with associated icons export a Record mapping:
   ```ts
   import type { ComponentType, SVGProps } from "react";
   import { ClockIcon, ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";

   export const scriptStatusToIcon: Record<ScriptStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
       [ScriptStatus.Pending]: ClockIcon,
       [ScriptStatus.InProgress]: ArrowPathIcon,
       [ScriptStatus.Completed]: CheckIcon,
   };
   ```
   Components import the icon map from the enum file instead of defining it locally.

---

## API Hooks (React Query)

### Query Hook

```tsx
import { useQuery } from "@tanstack/react-query";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

export function useShowProject(projectUuid: string) {
    const query = useQuery({
        queryKey: projectQueryKeys.show(projectUuid),
        queryFn: async () => {
            const res = await httpClient.get(`/projects/${projectUuid}`);
            return Project.fromJSON(res.data);
        },
    });

    return {
        project: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
```

### Paginated Query Hook (useInfiniteQuery)

For paginated lists with infinite scroll, use `useInfiniteQuery` instead of manual pagination state:

```tsx
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

export function useListPaginatedProjects(limit: number = 10) {
    const query = useInfiniteQuery({
        queryKey: projectQueryKeys.list(limit),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get(`/projects`, {
                params: { page: pageParam, limit }
            });
            return res.data.map((json: any) => Project.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
    });

    const projects = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        projects,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
```

Key patterns:
- `initialPageParam: 1` — pages start at 1
- `getNextPageParam` — returns next page number if `lastPage.length === limit`, otherwise `undefined` (no more pages)
- Flatten pages with `query.data?.pages.flat()` via `useMemo`
- Map TanStack properties to a consistent return interface: `isLoadingMore`, `hasMore`, `listMore`
- Compatible with `useInfiniteScroll` hook: `useInfiniteScroll(ref, hasMore, isLoadingMore, listMore)`

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
interface UseCreateIntegrationProps {
    projectUuid: string;
    platform: Platform;
}

export function useCreateIntegration({ projectUuid, platform }: UseCreateIntegrationProps) {
    const queryClient = useQueryClient();

    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        platform,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
        },
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateIntegrationResponse>('/integrations', {
                projectUuid,
                platform: platform,
            });
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
        createIntegration: mutation.mutate,
        isPending: mutation.isPending || isOpen,
        integrationUuid,
        oauthError: oauthError ?? (mutation.error ? OAuthErrorCode.TokenExchangeFailed : null),
        error: mutation.error,
        reset,
    };
}
```

### OAuth Hook Conventions

1. **Generic hook** - `useCreateIntegration` works with any platform via props
2. **Return state values** (`integrationUuid`, `oauthError`) instead of callbacks
3. **Combine pending states** - `isPending` includes both mutation and popup open state
4. **Combine errors** - `oauthError` includes both popup errors and mutation errors
5. **Single reset function** - resets both mutation and OAuth state
6. **Use `useOAuthPopup`** utility hook for popup management with `onSuccess` callback
7. **Invalidate queries** on success via `onSuccess` callback

---

## Zustand Stores

### Basic Store

```tsx
import { create } from 'zustand';

type CreateProjectModalState = {
    isCreateModalOpen: boolean;
};

type CreateProjectModalAction = {
    setIsCreateModalOpen: (isCreateModalOpen: boolean) => void;
};

export const useCreateProjectModalStore = create<CreateProjectModalState & CreateProjectModalAction>((set) => ({
    isCreateModalOpen: false,
    setIsCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
}));
```

### Persisted Store (Recommended)

Use the `persist` middleware for stores that need to save state to localStorage. This is simpler and less error-prone than manual localStorage handling.

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FocusProjectState = {
    focusedProjectUuid: string | null;
};

type FocusProjectAction = {
    setFocusedProjectUuid: (uuid: string | null) => void;
};

export const useFocusProjectStore = create<FocusProjectState & FocusProjectAction>()(
    persist(
        (set) => ({
            focusedProjectUuid: null,
            setFocusedProjectUuid: (uuid) => set({ focusedProjectUuid: uuid }),
        }),
        {
            name: 'app:project:focused',
        }
    )
);
```

### Resettable Store (User-Specific Data)

Use `createResettableStore` (from `~/stores/createResettableStore`) instead of `create` for stores that hold user-specific data. On logout or 401, all resettable stores are automatically reset to their initial state via `resetAllStores()`.

This follows [Zustand's official reset pattern](https://zustand.docs.pmnd.rs/guides/how-to-reset-state): a custom `create` wrapper that registers stores in a global registry and uses the built-in `store.getInitialState()` method for resets.

```tsx
import { persist } from 'zustand/middleware';
import { createResettableStore } from '~/stores/createResettableStore';

export const useFocusProjectStore = createResettableStore<FocusProjectState & FocusProjectAction>()(
    persist(
        (set) => ({
            focusedProjectUuid: null,
            setFocusedProjectUuid: (uuid) => set({ focusedProjectUuid: uuid }),
        }),
        {
            name: 'app:project:focused',
        }
    )
);
```

For non-persisted stores:

```tsx
import { createResettableStore } from '~/stores/createResettableStore';

export const useMobileSidebarStore = createResettableStore<MobileSidebarState & MobileSidebarAction>()(
    (set) => ({
        isOpen: false,
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
    })
);
```

**Do NOT use `createResettableStore`** for UI preference stores (theme, sidebar, filters) — these should survive logout.

### Session Cleanup

On logout or 401, `clearSessionData()` (from `~/services/session/clearSessionData`) is called automatically. It:
1. Calls `resetAllStores()` — resets all resettable Zustand stores to initial state (including localStorage for persisted stores)
2. Calls `queryClient.cancelQueries()` + `queryClient.clear()` — cancels in-flight queries then wipes all React Query cached data

### Conventions

1. **Separate State and Action types**
2. **Combine types** with `&` in `create<State & Action>`
3. **Use `persist` middleware** for persistence
4. **Use `createResettableStore`** instead of `create` for user-specific stores
5. **Namespace storage keys** with `app:{domain}`
6. **Simple setters** for state updates

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

Routes are defined in `src/router.tsx` using `createBrowserRouter` from `react-router-dom`. The protected tree is split into two **shells** — one for agency users, one for clients — each with its own layout that asserts the role:

```tsx
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    { path: prelaunchPath, element: <PrelaunchPage /> },
    {
        element: <PrelaunchGuardLayout />,
        children: [
            { path: loginPath, element: <LoginPage /> },
            { path: registerPath, element: <RegisterPage /> },
            {
                element: <ProtectedLayout />,
                errorElement: <ErrorBoundary />,
                children: [
                    { index: true, element: <RootRedirect /> },
                    {
                        element: <AgencyShellLayout />,
                        children: [
                            { path: agencyHomePath, element: <AgencyHomePage /> },
                            { path: agencyTasksPath, element: <AgencyTasksPage /> },
                            // ...
                        ],
                    },
                    {
                        element: <ClientShellLayout />,
                        children: [
                            { path: clientHomePath, element: <ClientHomePage /> },
                        ],
                    },
                ],
            },
        ],
    },
]);
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
2. **Protected routes** wrapped in auth-checking layout (`ProtectedLayout`) and then in a **shell layout** (`AgencyShellLayout` or `ClientShellLayout`) that asserts the role
3. **Redirect to login** if not authenticated
4. **Show loading** while checking auth state
5. **Feature routes** live under their shell prefix (e.g. `/agency/tasks`, `/agency/contents`); files live under `routes/agency/` or `routes/client/`
6. **Public/auth routes** stay flat at the root of `routes/` (`login.tsx`, `register.tsx`, `verify-otp.tsx`, etc.)

### Route Path Constants

All route paths are defined as camelCase constants in `src/routes/routePaths.ts`. Never hardcode route paths as strings — always import and use the constant. Shell-scoped paths are prefixed with the shell name (`agency*Path`, `client*Path`) and derived from a single area-prefix constant per shell:

```tsx
// src/routes/routePaths.ts
export const homePath = '/'  // smart redirect entry — RootRedirect dispatches by role

export const agencyAreaPrefix = '/agency'
export const agencyHomePath = agencyAreaPrefix
export const agencyTasksPath = `${agencyAreaPrefix}/tasks`
export const agencySettingsSubscriptionPath = `${agencyAreaPrefix}/settings/subscription`

export const clientAreaPrefix = '/client'
export const clientHomePath = clientAreaPrefix

// Dynamic helper
export function insightsPostDetailPath(postUuid: string): string {
    return `${agencyAreaPrefix}/insights/posts/${postUuid}`
}

// Usage
import { agencyTasksPath, homePath } from "~/routes/routePaths"
navigate(agencyTasksPath, { replace: true })
navigate(homePath)  // public callers stay role-agnostic; RootRedirect dispatches
```

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

## Global API Error Handling

### Architecture

All mutation errors are caught globally by `MutationCache.onError` in `queryClient.ts` and routed through a centralized handler. No per-hook or per-component error display is needed for mutations.

```
MutationCache.onError (queryClient.ts)
  -> handleMutationError (apiErrorHandler.ts)
    -> 401? redirect to /login
    -> Other? useToastStore.getState().addToast(...)
      -> ToastContainer renders toasts (auto-dismiss 5s)
```

### Files

| File | Purpose |
|------|---------|
| `services/apiErrorHandler/apiErrorHandler.ts` | `handleMutationError()` -- maps errors to French messages and dispatches toasts |
| `stores/toast/toastStore.ts` | Zustand store managing the toast list |
| `components/ui/ToastContainer.tsx` | Renders active toasts in a fixed top-right stack |

### How It Works

1. **401 Unauthorized** -> redirects to `/login` via `window.location.href` (hard redirect clears client state). Skips redirect if already on `/login`.
2. **Other `CustomHttpException`** -> maps `statusCode` to a French error message. For 400 and 409, uses the backend message from `error.data.message` if available.
3. **Unknown errors** -> shows a generic "Une erreur est survenue" toast.

### Adding Success Toasts

For success feedback, call `addToast` from `onSuccess` in mutation hooks:

```tsx
import { useToastStore } from '~/stores/toast/toastStore'

onSuccess: () => {
    useToastStore.getState().addToast('success', 'Projet cree avec succes')
    queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
}
```

### Conventions

1. **Error toasts are automatic** -- do not add per-hook error toast logic
2. **Success toasts are opt-in** -- add them in `onSuccess` callbacks where user feedback is needed
3. **Use `useToastStore.getState()`** to access the store outside React components (e.g., in callbacks or services)
4. **Messages are in French** -- all user-facing error messages use French

---

## Responsive Patterns

### `useIsDesktop` Hook

The `useIsDesktop()` hook (from `~/hooks/useIsDesktop`) uses `window.matchMedia('(min-width: 768px)')` to detect the viewport breakpoint in JavaScript. It returns a boolean and updates reactively on resize.

### When to Use `useIsDesktop` vs CSS Breakpoints

| Scenario | Approach | Example |
|----------|----------|---------|
| **Different component trees** for mobile/desktop | `useIsDesktop()` + conditional rendering | Mobile shows a list OR an editor; desktop shows both side-by-side |
| **Show/hide an entire component** | `useIsDesktop()` + conditional rendering | Calendar only on desktop, back button only on mobile |
| **Style adjustments** (spacing, font size, grid) | CSS breakpoint classes (`md:p-5`, `md:grid-cols-3`) | Padding, gaps, font sizes, widths |

### Why Not CSS `hidden md:block`?

CSS-based show/hide (`hidden md:block` / `md:hidden`) keeps **both** component trees mounted in the DOM simultaneously. This causes issues when components have:
- Form validation (`required` fields in a hidden form trigger browser errors)
- Duplicate element IDs
- Duplicate state or side effects (e.g., two `useInfiniteScroll` refs)

Using `useIsDesktop()` ensures only one version is mounted at a time.

### Example

```tsx
import { useIsDesktop } from "~/hooks/useIsDesktop";

export default function MyPageView() {
    const isDesktop = useIsDesktop();

    if (!isDesktop) {
        return <MobileLayout />;
    }

    return <DesktopLayout />;
}
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
