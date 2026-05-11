# Sidebar Layout & Mobile Burger Menu

## Overview

The app ships **two** sidebars (agency and client), each rendered by its own shell layout. To avoid duplicating the chrome, both sidebars sit on top of a shared `SidebarShell` (desktop) and `MobileSidebarShell` (mobile drawer). The shells own the outer container, padding, bottom divider, legal footer, and — for the mobile shell — burger button + drawer overlay + ESC/scroll-lock/auto-close behavior. Each domain sidebar (`DesktopSidebar` for agency, `ClientDesktopSidebar` for client) only provides its content: the top section, the bottom nav, and an optional CTA.

On desktop (≥768px / `md` breakpoint), the active shell's sidebar is visible as a fixed left panel. On mobile (<768px), it is replaced by a burger menu that opens a left-sliding drawer overlay.

## Architecture

```
ProtectedLayout (auth + onboarding gate)
  ├── /            → RootRedirect (Navigate by role)
  ├── /agency/*    → AgencyShellLayout (asserts non-client)
  │                    ├── MobileSidebar (mobile-only: header bar + drawer overlay)
  │                    ├── DesktopSidebar (desktop-only)
  │                    └── <Outlet /> (agency page content)
  └── /client/*    → ClientShellLayout (asserts client)
                       ├── ClientMobileSidebar (mobile-only: header bar + drawer overlay)
                       ├── ClientDesktopSidebar (desktop-only)
                       └── <Outlet /> (client page content)
```

## Key Files

| File | Description |
|------|-------------|
| `components/agency/AgencyShellLayout.tsx` | Layout route component — wraps `/agency/*` pages with sidebar + mobile menu; asserts `!user.isClient` |
| `components/client-portal/ClientShellLayout.tsx` | Layout route component — wraps `/client/*` pages; asserts `user.isClient` |
| `components/auth/RootRedirect.tsx` | Index of `ProtectedLayout` — `Navigate` to `/agency` or `/client` based on `user.isClient` |
| `components/sidebar/SidebarShell.tsx` | **Shared** desktop chrome — outer container, top-section padding, bottom nav slot, divider, optional CTA slot, legal footer. Both `DesktopSidebar` and `ClientDesktopSidebar` render their content through it. |
| `components/sidebar/MobileSidebarShell.tsx` | **Shared** mobile chrome — burger header bar, drawer portal, backdrop, ESC + body-scroll-lock + auto-close-on-route-change. Takes a `desktop` ReactNode and a `getPageLabelKey(pathname)` resolver. |
| `components/sidebar/DesktopSidebar.tsx` | Agency sidebar content (project selector, nav, platforms, settings, premium CTA) — composed inside `SidebarShell` |
| `components/sidebar/MobileSidebar.tsx` | Thin wrapper: `<MobileSidebarShell desktop={<DesktopSidebar />} getPageLabelKey={getCurrentPageLabelKey} />` |
| `components/client-portal/sidebar/ClientDesktopSidebar.tsx` | Client sidebar content — agency-branded header (name tinted with `agency.brandColor`), Home + Settings nav. Fetches the agency via `useShowProject(user.clientProjectUuid)`. Composed inside `SidebarShell`. |
| `components/client-portal/sidebar/ClientMobileSidebar.tsx` | Thin wrapper: `<MobileSidebarShell desktop={<ClientDesktopSidebar />} getPageLabelKey={...} />` with a client-specific label resolver. |
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

The old `SidebarLayout` was renamed to **`AgencyShellLayout`** ([components/agency/AgencyShellLayout.tsx](../src/components/agency/AgencyShellLayout.tsx)) and now lives next to the rest of the agency-only UI. It composes `DesktopSidebar` and `MobileSidebar` (which stay in `components/sidebar/` as sidebar primitives) and asserts the user is a non-client — clients hitting an `/agency/*` URL are redirected to `/client`.

The client subtree is wrapped by a sibling **`ClientShellLayout`** ([components/client-portal/ClientShellLayout.tsx](../src/components/client-portal/ClientShellLayout.tsx)) which composes `ClientDesktopSidebar` and `ClientMobileSidebar` and asserts `user.isClient` (non-clients hitting `/client/*` get redirected to `/agency`).

### Why a shell + per-domain content components

The original phasing plan called for a single role-conditioned sidebar. The agency sidebar grew organically around project picking, integration tiles, and a premium CTA — none of which apply to clients. Folding those into a role-aware `if` ladder inside one component would have made it hard to read. Instead we extracted the *chrome* (`SidebarShell`, `MobileSidebarShell`) — outer container, padding, divider, legal footer, mobile drawer — and let each domain own its *content* (top section, bottom nav, optional CTA). This keeps the duplication to zero on the layout side, lets each domain sidebar stay focused on what's specific to it, and makes future shells (e.g. an admin tool) trivial to add.

Smart `/` redirect lives in `<RootRedirect />` ([components/auth/RootRedirect.tsx](../src/components/auth/RootRedirect.tsx)), used as the index route inside `ProtectedLayout`.
