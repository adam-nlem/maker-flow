# Client Portal Feature (Frontend)

## Overview

The frontend exposes two role-distinct shells over the same authentication: an **agency** shell under `/agency/*` (`/agency`, `/agency/tasks`, `/agency/contents`, `/agency/scripts`, `/agency/calendar`, `/agency/settings/*`) and a **client portal** shell under `/client/*` (`/client` today). Each shell has its own layout component and asserts its role internally — `ProtectedLayout` stays focused on auth + onboarding only.

The actual client dashboard is built in Phase 7; the role-aware client sidebar in Phase 6.

## Role-based routing

`useCurrentUser` returns a `User` model with a `role` field (`UserRole` enum) and a derived `isClient` getter. Three pieces handle dispatch:

| Component | Role |
|---|---|
| `ProtectedLayout` ([routes/protected.tsx](../src/routes/protected.tsx)) | Auth + onboarding gates only. Renders `<Outlet />` once both pass. |
| `RootRedirect` ([components/auth/RootRedirect.tsx](../src/components/auth/RootRedirect.tsx)) | Index route under `ProtectedLayout`. `<Navigate to={user.isClient ? clientHomePath : agencyHomePath} replace />`. |
| `AgencyShellLayout` ([components/agency/AgencyShellLayout.tsx](../src/components/agency/AgencyShellLayout.tsx)) | Wraps the `/agency/*` subtree. Asserts `!user.isClient` (clients are bounced to `/client`). Composes `DesktopSidebar` + `MobileSidebar`. |
| `ClientShellLayout` ([components/client-portal/ClientShellLayout.tsx](../src/components/client-portal/ClientShellLayout.tsx)) | Wraps the `/client/*` subtree. Asserts `user.isClient` (non-clients are bounced to `/agency`). Passthrough today; Phase 6 fills in a client-styled sidebar. |

`LoginPage`, `VerifyOtpPage`, and the legal/onboarding/integrations pages all `navigate(homePath)` (`/`) on success or "back home" — `RootRedirect` then dispatches by role. Single source of truth, also handles refresh, deep-links, and bookmarks.

## Routes

```ts
// routePaths.ts (excerpt)
export const homePath = '/'                         // smart redirect entry
export const agencyAreaPrefix = '/agency'
export const agencyHomePath = agencyAreaPrefix      // bare prefix is the home
export const agencyTasksPath = `${agencyAreaPrefix}/tasks`
// ...
export const clientAreaPrefix = '/client'
export const clientHomePath = clientAreaPrefix
```

Each shell prefix is the single source of truth — every shell-scoped path is derived from it. Pages live under `routes/agency/` and `routes/client/`.

```
ProtectedLayout (auth + onboarding only)
├── /            → RootRedirect (Navigate by role)
├── /agency/*    → AgencyShellLayout
│   ├── /agency               → AgencyHomePage
│   ├── /agency/tasks         → AgencyTasksPage
│   ├── /agency/contents      → AgencyContentsPage
│   ├── /agency/scripts       → AgencyScriptsPage
│   ├── /agency/calendar      → AgencyCalendarPage
│   └── /agency/settings/...  → AgencySettingsLayout
└── /client/*    → ClientShellLayout
    └── /client                → ClientHomePage
```

## Models

`models/User.ts` was extended with `role` (UserRole | null), `clientProjectUuid` (string | null), `agency` (Agency | null), and an `isClient` getter. `models/Agency.ts` is a small class mirroring the nested object the backend exposes (`uuid`, `name`, `brandColor`, `contactEmail`, `website`).

## Stub page

`routes/client/home.tsx` (`ClientHomePage`) is a placeholder shown until Phase 7. It greets the client by first name, displays the agency name (tinted with `agency.brandColor` if set), and offers a logout via the existing `useLogout` hook. i18n keys live under the `clientPortal` namespace (`services/i18n/locales/clientPortal/{fr,en}.json`).

## Out of scope (this phase)

- Client-styled sidebar inside `ClientShellLayout` → Phase 6
- Real client dashboard widgets (analytics, contents, integrations) → Phase 7
- Per-role onboarding flows → Phase 9 — in the meantime, `OnboardingCreateAgencyStep` (the first onboarding step) auto-advances on mount when `user.role === ROLE_CLIENT`, so clients never see an agency-creation prompt.
- `/invite/{token}` setup page → Phase 6
