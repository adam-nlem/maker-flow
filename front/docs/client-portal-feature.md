# Client Portal Feature (Frontend)

## Overview

The frontend exposes two role-distinct shells over the same authentication: an **agency** shell under `/agency/*` (`/agency`, `/agency/tasks`, `/agency/contents`, `/agency/scripts`, `/agency/calendar`, `/agency/settings/*`) and a **client portal** shell under `/client/*` (`/client`, `/client/settings/*`). Each shell has its own layout component and asserts its role internally — `ProtectedLayout` stays focused on auth + onboarding only.

A public `/invite/:token` page sits outside both shells and turns an emailed invitation link into a logged-in client or collaborator session.

The client dashboard (Phase 7) lives at `/client` and renders the same analytics widgets as the agency home, scoped to the client's single project.

## Role-based routing

`useCurrentUser` returns a `User` model with a `roles` array, a derived `role` getter (precedence Admin > Editor > Viewer > Client), and an `isClient` getter. Four pieces handle dispatch:

| Component | Role |
|---|---|
| `ProtectedLayout` ([routes/protected.tsx](../src/routes/protected.tsx)) | Auth + onboarding gates only. Renders `<Outlet />` once both pass. |
| `RootRedirect` ([components/auth/RootRedirect.tsx](../src/components/auth/RootRedirect.tsx)) | Index route under `ProtectedLayout`. `<Navigate to={user.isClient ? clientHomePath : agencyHomePath} replace />`. |
| `AgencyShellLayout` ([components/agency/AgencyShellLayout.tsx](../src/components/agency/AgencyShellLayout.tsx)) | Wraps the `/agency/*` subtree. Asserts `!user.isClient` (clients are bounced to `/client`). Composes `DesktopSidebar` + `MobileSidebar`. |
| `ClientShellLayout` ([components/client-portal/ClientShellLayout.tsx](../src/components/client-portal/ClientShellLayout.tsx)) | Wraps the `/client/*` subtree. Asserts `user.isClient` (non-clients are bounced to `/agency`). Composes `ClientDesktopSidebar` + `ClientMobileSidebar`. |

`LoginPage`, `VerifyOtpPage`, the legal/onboarding/integrations pages, and the `/invite/:token` setup page all `navigate(homePath)` (`/`) or to the matching shell home on success — `RootRedirect` then dispatches by role. Single source of truth, handles refresh, deep-links, and bookmarks.

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
export const clientSettingsPath = `${clientAreaPrefix}/settings`
export const clientSettingsGeneralPath = `${clientSettingsPath}/general`

// Invitations (public, tokenized link from welcome emails)
export const inviteAreaPrefix = '/invite'
export const inviteRouteMatcher = `${inviteAreaPrefix}/:token`
export const invitePath = (token: string) => `${inviteAreaPrefix}/${token}`
```

Each shell prefix is the single source of truth — every shell-scoped path is derived from it. Pages live under `routes/agency/` and `routes/client/`.

```
PrelaunchGuardLayout
├── /invite/:token  → InviteTokenPage (public, outside ProtectedLayout)
└── ProtectedLayout (auth + onboarding only)
    ├── /            → RootRedirect (Navigate by role)
    ├── /agency/*    → AgencyShellLayout
    │   ├── /agency               → AgencyHomePage
    │   ├── /agency/tasks         → AgencyTasksPage
    │   ├── /agency/contents      → AgencyContentsPage
    │   ├── /agency/scripts       → AgencyScriptsPage
    │   ├── /agency/calendar      → AgencyCalendarPage
    │   └── /agency/settings/...  → AgencySettingsLayout
    └── /client/*    → ClientShellLayout
        ├── /client                → ClientHomePage
        └── /client/settings/...   → ClientSettingsLayout
```

## Models

`models/User.ts` carries `roles` (string[]), `clientProjectUuid` (string | null), `agency` (Agency | null, populated only for collaborators), `isClient` and `hasRole(role)` getters.

`models/Project.ts` gained an optional `agency` field (nullable). The backend serializes it only under the `api_project_get_by_uuid` group, so list responses are unchanged. The client sidebar fetches the project via `useShowProject(user.clientProjectUuid)` and renders branding from `project.agency`.

`models/Invitation.ts` was extended for the public setup page: `type` (InvitationType), `agency` (`{ name, brandColor }`), `project` (`{ name } | null`), and `createdBy` (`{ firstName, lastName } | null`). All new fields are optional in JSON parsing so existing list endpoints (which use `api_invitations_list`) keep working.

## Client sidebar

Both the agency and the client sidebars sit on top of a shared `SidebarShell` (`components/sidebar/SidebarShell.tsx`) that provides the outer container, top-section padding, bottom-nav slot + divider, optional CTA slot, and the legal footer. Each domain only contributes the content.

`components/client-portal/sidebar/ClientDesktopSidebar.tsx` feeds `SidebarShell` with:

- Top section: agency name (tinted with `project.agency.brandColor` when set), greeting line with the user's first name. Shimmer while the project query is loading. Then a single Home tile pointing at `clientHomePath`.
- Bottom nav: Settings tile pointing at `clientSettingsGeneralPath`.
- No CTA prop (so the shell renders nothing between the divider and the footer) — clients have no project picker, no integration tiles, and no premium CTA.

`ClientMobileSidebar.tsx` is a thin wrapper over the shared `MobileSidebarShell`: it passes `<ClientDesktopSidebar />` as the drawer content and a client-specific `getPageLabelKey` for the mobile header label. All burger / portal / ESC / scroll-lock / auto-close behavior lives in the shell.

## Client dashboard

`/client` is rendered by `ClientHomePage` ([routes/client/home.tsx](../src/routes/client/home.tsx)). It is **view-only** in Phase 7 — connecting integrations from the client side is deferred to Phase 8.

The page reuses the agency-home analytics components verbatim:
- `HomeOverviewCards` (4 KPI tiles)
- `IntegrationDetailCardRow` (per-integration metric cards)
- `HomeViewsEvolutionChart` (multi-line per-platform views)
- `HomeEngagementChart` (horizontal bar per-platform engagement)

`projectUuid` comes from `useCurrentUser().user?.clientProjectUuid` — no project picker, no `useFocusProjectStore`. Data is fed by `useListIntegrations` + `useListIntegrationInsights` with that UUID, and the time-period selector reuses the shared `useHomePeriodStore`. Layout is a single column (no `HomeScriptsPanel`, no right pane).

When the agency hasn't connected any integrations yet, the page renders an inline placeholder (`clientPortal:home.empty.*`) explaining the dashboard is being prepared. The agency-side `ConnectIntegrationPlaceholder` is intentionally **not** reused, because its CTA opens an agency-only login modal.

## Subscription gate

When a client's agency has no active subscription, every `/client/*` route is replaced by a "Access suspended — contact your agency" full-screen card (`ClientPortalLockedView`) that exposes only a Logout button.

The gate is enforced **on the backend**, not via a serialized boolean: `GET /api/projects/:uuid` throws `AgencySubscriptionInactiveException` (code `27003`, HTTP 403) when the requester is a `ROLE_CLIENT` user whose agency has no active subscription. `ClientShellLayout` calls `useShowProject(user.clientProjectUuid)` on every render (the client sidebar already does, so React Query dedupes), and when the error carries code `27003` it short-circuits to `ClientPortalLockedView` before rendering any sidebar or outlet. Agency members are never gated, so they can still reach their billing settings to re-subscribe.

`useShowProject` sets `retry: false` so the lock screen renders immediately on the 403 instead of waiting for React Query's default exponential backoff.

## Client settings

`/client/settings/:section` reuses the same `SettingsPageView` component as the agency side — the view accepts a `basePath` prop so it builds nav links into the right shell. `SettingsPageView` already filters sections via `getSettingsSectionsForRoles(user.roles)`, which returns `[General]` for `ROLE_CLIENT`. Anything other than `:section === 'general'` redirects back to `clientSettingsGeneralPath`. The General section's `GeneralSettings` component (profile + password change) is reused unchanged.

## Invite token setup page

`/invite/:token` is public (no auth) and rendered by `InviteTokenPage` → `InviteSetupPageView`:

1. If a session already exists (`useCurrentUser` returns a user), the page refuses to render the setup form and instead shows a *"You're already signed in as `{email}` — sign out first"* screen with a Logout button (`useLogout`). This avoids overwriting an existing identity mid-flow.
2. Otherwise, `useShowInvitation(token)` fetches the invitation summary via the public `GET /api/invitations/:token` endpoint. Errors (29001 not found, 29002 expired, 29003 already used) are rendered inline through the same exception-code → translation map (`services/apiErrorHandler/errorCodeMessages.ts`) used everywhere else.
3. The header copy branches on `invitation.type`:
   - Client: *"Welcome to your `{agencyName}` portal"* with the heading + envelope icon tinted by `agency.brandColor`.
   - Collaborator: *"Join `{agencyName}` on MakerFlow"* with the user role from `userRoleTranslationKeys` interpolated into the subtitle.
4. Pre-filled (read-only) email + first/last name, password + confirm fields with the same [PasswordRules](password-validation-feature.md) checklist used on `/register`.
5. On submit, `useCompleteInvitation` calls `POST /api/invitations/:token/complete` with `{ password }`. The backend returns the new user (serialized with `api_user_me`) and sets the `X-API-TOKEN` cookie. The hook seeds `userQueryKeys.me` and invalidates so the rest of the app picks up the new session instantly.
6. The page then navigates to `clientHomePath` if the new user `isClient`, else `agencyHomePath`.

## Hooks

| Hook | Endpoint | Notes |
|---|---|---|
| `useShowProject(projectUuid)` ([hooks/api/projects/useShowProject.ts](../src/hooks/api/projects/useShowProject.ts)) | `GET /api/projects/:uuid` | Self-disabled when `projectUuid` is falsy. Returns `{ project, isLoading, error }` with `project.agency` populated thanks to the `api_project_get_by_uuid` group. `retry: false` so the subscription gate (HTTP 403 / code 27003) surfaces immediately to `ClientShellLayout`. |
| `useShowInvitation(token)` ([hooks/api/invitations/useShowInvitation.ts](../src/hooks/api/invitations/useShowInvitation.ts)) | `GET /api/invitations/:token` | Public — no auth header needed. `retry: false` so 404/410-class responses don't get retried. |
| `useCompleteInvitation()` ([hooks/api/invitations/useCompleteInvitation.ts](../src/hooks/api/invitations/useCompleteInvitation.ts)) | `POST /api/invitations/:token/complete` | Mutation. On success, seeds `userQueryKeys.me` with the new user then invalidates so dependent queries refetch. |

## Reuse — no duplication

- `SettingsPageView` is a single component used by both `AgencySettingsLayout` and `ClientSettingsLayout`. Only the `basePath` prop differs.
- `GeneralSettings` is reused as-is for clients (same profile + password forms).
- Mutation error handling, exception-code → translation mapping, and the `PasswordRules` component are shared.
- `mobileSidebarStore` is a UI-only Zustand store shared by both mobile drawers.

## Out of scope (this phase)

- Connecting integrations from the client portal → Phase 8 (today the dashboard is view-only).
- `/client/contents` → Phase 8.
- Per-role onboarding flows → Phase 9. In the meantime, `OnboardingCreateAgencyStep` (the first onboarding step) auto-advances on mount when `user.role === ROLE_CLIENT`, so clients never see an agency-creation prompt.
