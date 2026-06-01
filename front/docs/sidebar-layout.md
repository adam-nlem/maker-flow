# Sidebar Layout & Mobile Burger Menu

## Overview

The app ships **two** sidebars (agency and client), each rendered by its own shell layout under the universal top bar (see [topbar-layout.md](topbar-layout.md)). To avoid duplicating the chrome, both sidebars sit on top of a shared `SidebarShell` (desktop) and `MobileSidebarShell` (mobile drawer). The shells own the outer container, padding, and identity divider; each domain sidebar (`DesktopSidebar` for agency, `ClientDesktopSidebar` for client) only provides its content: the top section and an optional identity tile.

The desktop sidebar is a **thin icon rail** (`w-14`, ~56 px). Each nav button is an icon-only tile with a hover tooltip carrying the label (`IconRailTile`). The project selector, integration tiles and identity tile all render in compact form (each component exposes a `compact` prop). The top bar above the rail carries section/page breadcrumb and per-page actions, so the rail itself stays focused on icon-based navigation.

On desktop (≥768px / `md` breakpoint), the rail is visible inline. On mobile (<768px), it is rendered inside the slide-out drawer, opened by the hamburger in the top bar.

## Architecture

```
ProtectedLayout (auth + onboarding gate)
  ├── /            → RootRedirect (Navigate by role)
  ├── /agency/*    → AgencyShellLayout (asserts non-client)
  │                    └── TopBar variant="agency"
  │                          ├── DesktopSidebar (icon rail, desktop-only)
  │                          ├── MobileSidebar (drawer overlay, mobile-only)
  │                          └── <Outlet /> (agency page content)
  └── /client/*    → ClientShellLayout (asserts client)
                       └── TopBar variant="client"
                             ├── ClientDesktopSidebar (icon rail, desktop-only)
                             ├── ClientMobileSidebar (drawer overlay, mobile-only)
                             └── <Outlet /> (client page content)
```

## Key Files

| File | Description |
|------|-------------|
| `components/agency/AgencyShellLayout.tsx` | Layout route component — wraps `/agency/*` pages in `<TopBar variant="agency">` and renders the sidebar + outlet inside it; asserts `!user.isClient` |
| `components/client/ClientShellLayout.tsx` | Layout route component — wraps `/client/*` pages in `<TopBar variant="client">`; asserts `user.isClient` |
| `components/auth/RootRedirect.tsx` | Index of `ProtectedLayout` — `Navigate` to `/agency` or `/client` based on `user.isClient` |
| `components/sidebar/SidebarShell.tsx` | **Shared** desktop chrome — `w-14` outer container, top-section padding, optional bottom-nav and identity slots. Both `DesktopSidebar` and `ClientDesktopSidebar` render their content through it. |
| `components/sidebar/MobileSidebarShell.tsx` | **Shared** mobile chrome — drawer portal, backdrop, ESC + body-scroll-lock + auto-close-on-route-change. Toggled by the top bar's hamburger via `useMobileSidebarStore`. |
| `components/sidebar/IconRailTile.tsx` | **Shared** icon-only sidebar button with a Tailwind hover tooltip. Used by both `DesktopSidebar` and `ClientDesktopSidebar`. |
| `components/sidebar/IdentityTile.tsx` / `IdentityPopover.tsx` | **Shared** bottom-of-rail identity tile (agency logo + name) with the floating/popover (user menu) logic. Used by both shells. |
| `components/sidebar/IdentityPopoverView.tsx` | **Shared** presentational identity card (header band, `AgencyLogo`, name/email/website, account block, Settings/Logout buttons). `forwardRef` + spreads div props; behavior is injected via `onSettings` / `onLogout` / `isLoggingOut`. `IdentityPopover` supplies the real handlers; the onboarding preview renders it statically (no handlers) with live `name` + `logoUrl`. |
| `components/agency/sidebar/DesktopSidebar.tsx` | Agency sidebar content — compact project selector, `IconRailTile` rows for the main nav, compact `IntegrationTile` rows for platforms, compact `IdentityTile` at the bottom — composed inside `SidebarShell` |
| `components/agency/sidebar/MobileSidebar.tsx` | Thin wrapper: `<MobileSidebarShell desktop={<DesktopSidebar />} />` |
| `components/client/sidebar/ClientDesktopSidebar.tsx` | Client sidebar content — Home + Contents nav (`IconRailTile`), platform icons (compact `IntegrationTile`), compact `IdentityTile`. Composed inside `SidebarShell`. |
| `components/client/sidebar/ClientMobileSidebar.tsx` | Thin wrapper: `<MobileSidebarShell desktop={<ClientDesktopSidebar />} />` |
| `stores/sidebar/mobileSidebarStore.ts` | Zustand store for mobile drawer open/close state (`isOpen`, `setIsOpen`, `toggle`) — opened from the top bar's hamburger button on mobile |
| `models/enums/NavigationItem.ts` | Enum with mapping records: i18n translation keys, paths (`agency*Path`), outline/solid icons, sidebar group constants (`sidebarMainNavigationItems`) |
| `utils/navigationHelpers.ts` | Pure helper functions: `getCurrentNavigationItem`, `getCurrentPageLabelKey`, `isNavigationItemSelected` (Home item is matched exactly so nested `/agency/*` routes don't keep Home selected) — reused by the top bar to auto-derive its section label |

## Responsive Behavior

- **Breakpoint**: `md` (768px) — standard Tailwind breakpoint
- **Desktop** (≥768px): `DesktopSidebar` visible inline, `MobileSidebar` not rendered
- **Mobile** (<768px): `DesktopSidebar` not rendered, `MobileSidebar` header bar visible with burger icon
- **Detection**: Uses `useIsDesktop()` hook for JS-based conditional rendering (see coding-style.md § Responsive Patterns)

## Mobile Drawer

- Opens via the hamburger button in the top bar (mobile-only)
- Portal-based overlay (`createPortal` to `document.body`)
- Backdrop: `bg-black/40`, click-to-close
- ESC key closes the drawer
- Body scroll lock while open
- Auto-closes on route change (watches `location.pathname`)
- Renders the same `DesktopSidebar` / `ClientDesktopSidebar` icon rail inside — same content as desktop, zero duplication

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

Pages only render their own content. The shell handles `flex-1 min-w-0` inside the top bar's content area.

**Important:** Pages must use `h-full` (not `h-screen`) for their root container height. The shell already constrains the content area to the viewport via `TopBar`'s outer `h-screen`; using `h-screen` inside a page would overflow because the top-bar header itself takes ~56 px (`h-14`).

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
