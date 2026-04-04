# Sidebar Layout & Mobile Burger Menu

## Overview

The sidebar is rendered via a shared `SidebarLayout` route component that wraps all protected pages. On desktop (≥768px / `md` breakpoint), the sidebar is visible as a fixed left panel. On mobile (<768px), it is replaced by a burger menu that opens a left-sliding drawer overlay.

## Architecture

```
ProtectedLayout (auth guard)
  └── SidebarLayout (sidebar + content wrapper)
        ├── MobileSidebar (mobile-only: header bar + drawer overlay)
        ├── DesktopSidebar (desktop-only: hidden md:block)
        └── <Outlet /> (page content)
```

## Key Files

| File | Description |
|------|-------------|
| `components/sidebar/SidebarLayout.tsx` | Layout route component — wraps all protected pages with sidebar + mobile menu |
| `components/sidebar/DesktopSidebar.tsx` | The sidebar content (project selector, nav, platforms, settings, premium CTA) |
| `components/sidebar/MobileSidebar.tsx` | Self-contained mobile component: fixed header bar (app name + page label) with burger icon + portal-based drawer overlay rendering `DesktopSidebar` |
| `stores/sidebar/mobileSidebarStore.ts` | Zustand store for mobile drawer open/close state (`isOpen`, `setIsOpen`, `toggle`) |
| `models/enums/NavigationItem.ts` | Enum with mapping records: French translations, paths, outline/solid icons, sidebar group constants (`sidebarMainNavigationItems`, `sidebarBottomNavigationItems`) |
| `utils/navigationHelpers.ts` | Pure helper functions: `getCurrentNavigationItem`, `getCurrentPageLabel`, `isNavigationItemSelected` |

## Responsive Behavior

- **Breakpoint**: `md` (768px) — standard Tailwind breakpoint
- **Desktop** (≥768px): `DesktopSidebar` visible inline, `MobileSidebar` header bar hidden via `md:hidden`
- **Mobile** (<768px): `DesktopSidebar` hidden via `hidden md:block`, `MobileSidebar` header bar visible with burger icon

## Mobile Drawer

- Opens via burger icon (`Bars3Icon`) in the fixed header bar
- Portal-based overlay (`createPortal` to `document.body`)
- Backdrop: `bg-black/40`, click-to-close
- ESC key closes the drawer
- Body scroll lock while open
- Auto-closes on route change (watches `location.pathname`)
- Renders `DesktopSidebar` inside — same content as desktop, zero duplication

## Page Integration

Pages do **not** import or render the sidebar. The `SidebarLayout` provides it via the router:

```tsx
// router.tsx
{ element: <SidebarLayout />, children: [
    { index: true, element: <HomePage /> },
    { path: tasksPath, element: <TasksPage /> },
    // ...
]}
```

Pages only render their own content. The layout handles `flex-1 min-w-0` and mobile top padding (`pt-12 md:pt-0`) for the fixed mobile header.

## Store Pattern

The `mobileSidebarStore` follows the simple Zustand store pattern (no persistence, no `createResettableStore` — it's a UI preference store, not user-specific data):

```typescript
export const useMobileSidebarStore = create<State & Action>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
```
