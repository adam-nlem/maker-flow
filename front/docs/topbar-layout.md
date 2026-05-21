# Top Bar Layout

## Overview

Every logged-in route renders a horizontal top bar at the top of the **content column** — to the right of the sidebar, not above it. The bar carries shell-level chrome (brand cluster, auto-derived section breadcrumb, settings cog) plus an optional per-page action component selected from a route-keyed registry.

The top bar mirrors the sidebar's shared-shell + per-domain-content pattern:

| Sidebar | Top bar |
|---|---|
| `SidebarShell` (chrome) | `TopBarShell` (chrome) |
| `DesktopSidebar` (agency content) | `AgencyTopBar` (agency content) |
| `ClientDesktopSidebar` (client content) | `ClientTopBar` (client content) |

## Architecture

```
ProtectedLayout
  ├── /agency/*    → AgencyShellLayout
  │                    └── flex flex-row h-screen
  │                          ├── DesktopSidebar (icon rail, full height)
  │                          └── flex-1 flex-col
  │                                ├── AgencyTopBar (h-14)
  │                                └── <Outlet /> (page content)
  └── /client/*    → ClientShellLayout
                       └── flex flex-row h-screen
                             ├── ClientDesktopSidebar (icon rail, full height)
                             └── flex-1 flex-col
                                   ├── ClientTopBar (h-14)
                                   └── <Outlet /> (page content)
```

The sidebar spans full viewport height on the left. The top bar lives **inside** the content column so it doesn't cover the sidebar.

## Key Files

| File | Description |
|------|-------------|
| `components/topbar/TopBarShell.tsx` | **Shared** chrome — `h-14` outer container, mobile hamburger (opens the existing slide-out drawer via `useMobileSidebarStore.setIsOpen(true)`), `brand` slot, auto-derived `Section` breadcrumb via `getCurrentPageLabelKey(location.pathname)`, optional `actions` slot rendered before a parameterized settings cog. |
| `components/agency/topbar/AgencyTopBar.tsx` | Agency content — composes `TopBarShell` with the MakerFlow wordmark, `agencySettingsPath`, and the action component looked up from `agencyTopBarActions[location.pathname]`. |
| `components/agency/topbar/agencyTopBarActions.tsx` | Agency action registry — a `Record<string, ComponentType>` keyed by pathname. Each entry is a React component that the top bar renders when the current pathname matches. Action components are colocated in this file. |
| `components/client/topbar/ClientTopBar.tsx` | Client content — composes `TopBarShell` with the host agency's `<AgencyLogo />` + name (from `useShowProject(focusedProjectUuid).project?.agency`), `clientSettingsPath`, and the action component from `clientTopBarActions[location.pathname]`. Renders no brand cluster until the project resolves. |
| `components/client/topbar/clientTopBarActions.tsx` | Client action registry — same shape as the agency one, empty by default. |
| `services/i18n/locales/navigation/{en,fr}.json` | Reuses existing `items.*` keys for the breadcrumb section label; adds `openSettings` and `openSidebar` aria labels. |

## Per-page custom buttons

Pages don't import or render the top bar — the shell does it automatically, just like the sidebar. To add a custom button (or buttons) to the top bar for a specific page, **declare an action component in the appropriate registry**, keyed by the route's path constant.

Example — the "New draft" button on `/agency/reviews`:

```tsx
// components/topbar/agencyTopBarActions.tsx
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { agencyReviewsPath } from "~/routes/routePaths";

function NewReviewAction() {
    const { t } = useTranslation();
    const openCreatePanel = useReviewsStore((s) => s.openCreatePanel);

    return (
        <Button type="button" style="primary" width="w-auto" onClick={openCreatePanel}>
            <PlusIcon className="size-4 mr-1" strokeWidth={2} />
            {t("reviews:actions.create")}
        </Button>
    );
}

export const agencyTopBarActions: Record<string, ComponentType> = {
    [agencyReviewsPath]: NewReviewAction,
};
```

The action component uses existing Zustand stores (`useReviewsStore.openCreatePanel`) for its handlers, matching how the rest of the app shares state between unrelated components. Pages that need a new action add their component to this file; no other wiring is required.

## API

```ts
interface TopBarShellProps {
    brand: ReactNode;          // left cluster
    settingsPath: string;      // where the settings cog navigates
    actions?: ReactNode;       // optional buttons rendered before the settings cog
}
```

The breadcrumb is auto-derived from the current pathname using `getCurrentPageLabelKey` (in `utils/navigationHelpers.ts`), which reuses the same `NavigationItem` mappings the sidebar uses to highlight its nav items.

## Mobile

Below the `md` breakpoint, the top bar shows a leading hamburger button (instead of the sidebar inline). Tapping it opens the slide-out drawer via the existing `useMobileSidebarStore`. The drawer renders the same `DesktopSidebar` / `ClientDesktopSidebar` icon rail (see [sidebar-layout.md](sidebar-layout.md)).

## Page integration

Pages don't render the top bar — the shell handles it. Pages only need to:

1. Use `h-full` (not `h-screen`) for their root container — the content column inside the shell already constrains height via `flex-1 min-h-0` below the `h-14` top bar.
2. To add a custom button, register an action component in the appropriate `*TopBarActions` registry keyed by the route's path constant.
