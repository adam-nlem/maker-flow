# Sidebar Layout & Mobile Burger Menu

## Overview

The sidebar is rendered via the `AgencyShellLayout` route component that wraps the agency subtree (`/agency/*`). On desktop (≥768px / `md` breakpoint), the sidebar is visible as a fixed left panel. On mobile (<768px), it is replaced by a burger menu that opens a left-sliding drawer overlay. The client subtree (`/client/*`) uses a separate `ClientShellLayout` and does **not** render this sidebar yet — Phase 6 will give the client a dedicated shell.

## Architecture

```
ProtectedLayout (auth + onboarding gate)
  ├── /            → RootRedirect (Navigate by role)
  ├── /agency/*    → AgencyShellLayout (asserts non-client)
  │                    ├── MobileSidebar (mobile-only: header bar + drawer overlay)
  │                    ├── DesktopSidebar (desktop-only: hidden md:block)
  │                    └── <Outlet /> (agency page content)
  └── /client/*    → ClientShellLayout (asserts client; passthrough today)
                       └── <Outlet />
```

## Key Files

| File | Description |
|------|-------------|
| `components/agency/AgencyShellLayout.tsx` | Layout route component — wraps `/agency/*` pages with sidebar + mobile menu; asserts `!user.isClient` |
| `components/client-portal/ClientShellLayout.tsx` | Layout route component — wraps `/client/*` pages; asserts `user.isClient` |
| `components/auth/RootRedirect.tsx` | Index of `ProtectedLayout` — `Navigate` to `/agency` or `/client` based on `user.isClient` |
| `components/sidebar/DesktopSidebar.tsx` | The sidebar content (project selector, nav, platforms, settings, premium CTA) |
| `components/sidebar/MobileSidebar.tsx` | Self-contained mobile component: fixed header bar (app name + page label) with burger icon + portal-based drawer overlay rendering `DesktopSidebar` |
| `stores/sidebar/mobileSidebarStore.ts` | Zustand store for mobile drawer open/close state (`isOpen`, `setIsOpen`, `toggle`) |
| `models/enums/NavigationItem.ts` | Enum with mapping records: French translations, paths (now `agency*Path`), outline/solid icons, sidebar group constants (`sidebarMainNavigationItems`, `sidebarBottomNavigationItems`) |
| `utils/navigationHelpers.ts` | Pure helper functions: `getCurrentNavigationItem`, `getCurrentPageLabel`, `isNavigationItemSelected` (Home item is matched exactly so nested `/agency/*` routes don't keep Home selected) |

## Responsive Behavior

- **Breakpoint**: `md` (768px) — standard Tailwind breakpoint
- **Desktop** (≥768px): `DesktopSidebar` visible inline, `MobileSidebar` not rendered
- **Mobile** (<768px): `DesktopSidebar` not rendered, `MobileSidebar` header bar visible with burger icon
- **Detection**: Uses `useIsDesktop()` hook for JS-based conditional rendering (see coding-style.md § Responsive Patterns)

## Mobile Drawer

- Opens via burger icon (`Bars3Icon`) in the fixed header bar
- Portal-based overlay (`createPortal` to `document.body`)
- Backdrop: `bg-black/40`, click-to-close
- ESC key closes the drawer
- Body scroll lock while open
- Auto-closes on route change (watches `location.pathname`)
- Renders `DesktopSidebar` inside — same content as desktop, zero duplication

## Page Integration

Pages do **not** import or render the sidebar. `AgencyShellLayout` provides it via the router:

```tsx
// router.tsx
{ element: <AgencyShellLayout />, children: [
    { path: agencyHomePath, element: <AgencyHomePage /> },
    { path: agencyTasksPath, element: <AgencyTasksPage /> },
    // ...
]}
```

Pages only render their own content. The layout handles `flex-1 min-w-0` and mobile top padding (`pt-12`) for the fixed mobile header.

**Important:** Pages must use `h-full` (not `h-screen`) for their root container height. `AgencyShellLayout` constrains the content area to `h-screen` at the layout level. On mobile, `pt-12` reduces the available space by 48px. Using `h-screen` inside a page would cause a 48px overflow.

## Store Pattern

The `mobileSidebarStore` follows the simple Zustand store pattern (no persistence, no `createResettableStore` — it's a UI preference store, not user-specific data):

```typescript
export const useMobileSidebarStore = create<State & Action>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
```

## Shell split

The old `SidebarLayout` was renamed to **`AgencyShellLayout`** ([components/agency/AgencyShellLayout.tsx](../src/components/agency/AgencyShellLayout.tsx)) and now lives next to the rest of the agency-only UI. It still composes `DesktopSidebar` and `MobileSidebar` (which stay in `components/sidebar/` as sidebar primitives) and additionally asserts the user is a non-client — clients hitting an `/agency/*` URL are redirected to `/client`.

The client subtree is wrapped by a sibling **`ClientShellLayout`** ([components/client-portal/ClientShellLayout.tsx](../src/components/client-portal/ClientShellLayout.tsx)) which today is a passthrough plus a role assertion. Phase 6 fills it with a client-styled sidebar.

Smart `/` redirect lives in `<RootRedirect />` ([components/auth/RootRedirect.tsx](../src/components/auth/RootRedirect.tsx)), used as the index route inside `ProtectedLayout`.
