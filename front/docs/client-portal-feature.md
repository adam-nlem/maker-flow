# Client Portal Feature (Frontend)

## Overview

The frontend exposes two role-distinct shells over the same authentication: an **agency** shell under `/agency/*` (`/agency`, `/agency/tasks`, `/agency/contents`, `/agency/scripts`, `/agency/calendar`, `/agency/settings/*`) and a **client portal** shell under `/client/*` (`/client`, `/client/settings/*`). Each shell has its own layout component and asserts its role internally — `ProtectedLayout` stays focused on auth + onboarding only.

A public `/invite/:token` page sits outside both shells and turns an emailed invitation link into a logged-in client or collaborator session.

The client dashboard (Phase 7) lives at `/client` and renders the same analytics widgets as the agency home, scoped to the client's single project. Phase 8 adds `/client/contents` (a read-only view of the agency-side Contents page) and exposes OAuth integration management to clients (Connect CTA on `/client` home + sidebar "Integrations" tile). Phase 2 of the Post Draft workflow adds `/client/reviews` — clients review the agency's content uploads and either approve them in one click or open a modal to send written feedback. See [review-feature.md](review-feature.md) for the full feature.

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
export const clientReviewsPath = `${clientAreaPrefix}/drafts`
export const clientContentsPath = `${clientAreaPrefix}/contents`
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
        ├── /client/contents       → ClientContentsPage (read-only)
        └── /client/settings/...   → ClientSettingsLayout
```

## Models

`models/User.ts` carries `roles` (string[]), `agency` (Agency | null, populated only for collaborators), `isClient` and `hasRole(role)` getters. **No `clientProjectUuid` field** — clients obtain their project the same way agency members do: `GET /api/projects` returns the client's single project for `ROLE_CLIENT`, and `useFocusProjectStore` is seeded with that UUID by `useSyncFocusedProject()` in [`routes/protected.tsx`](../src/routes/protected.tsx). The backend column `user.project_id` stays as the source of truth for `ProjectVoter`, but is no longer serialized.

`models/Project.ts` gained an optional `agency` field (nullable). The backend serializes it only under the `api_project_get_by_uuid` group, so list responses are unchanged. The client sidebar fetches the project via `useShowProject(focusedProjectUuid)` and renders branding from `project.agency`.

`models/Invitation.ts` was extended for the public setup page: `type` (InvitationType), `agency` (identity payload — name, contactEmail, website), `project` (`{ name } | null`), and `createdBy` (`{ firstName, lastName } | null`). All new fields are optional in JSON parsing so existing list endpoints (which use `api_invitations_list`) keep working.

## Client sidebar

Both the agency and the client sidebars sit on top of a shared `SidebarShell` (`components/sidebar/SidebarShell.tsx`) that provides the outer container, top-section padding, bottom-nav slot + divider, optional CTA slot, and the legal footer. Each domain only contributes the content.

`components/client-portal/sidebar/ClientDesktopSidebar.tsx` feeds `SidebarShell` with:

- Top section: agency name, greeting line with the user's first name. Shimmer while the project query is loading. Then two nav tiles: **Home** (`clientHomePath`) and **Contents** (`clientContentsPath`). Below the nav, a **PLATEFORMES** section renders one `IntegrationTile` per platform (Instagram, YouTube, TikTok) — identical to the agency sidebar. Clicking a tile calls `useIntegrationLoginModalStore().openForProject(focusedProjectUuid, platform)`, which the single `IntegrationLoginModal` mount picks up.
- Bottom nav: Settings tile pointing at `clientSettingsGeneralPath`.
- No CTA prop (so the shell renders nothing between the divider and the footer) — clients have no project picker and no premium CTA.

The sidebar mounts `IntegrationLoginModal` once for the whole client shell (same pattern as the agency `DesktopSidebar`).

`ClientMobileSidebar.tsx` is a thin wrapper over the shared `MobileSidebarShell`: it passes `<ClientDesktopSidebar />` as the drawer content and a client-specific `getPageLabelKey` for the mobile header label. All burger / portal / ESC / scroll-lock / auto-close behavior lives in the shell.

## Client dashboard

`/client` is rendered by `ClientHomePage` ([routes/client/home.tsx](../src/routes/client/home.tsx)). It is **analytics-only** — clients view their dashboard and can connect new social integrations from here, but cannot edit or delete existing ones (agency members manage those from the agency UI).

The page reuses the agency-home analytics components verbatim:
- `HomeOverviewCards` (4 KPI tiles)
- `IntegrationDetailCardRow` (per-integration metric cards)
- `HomeViewsEvolutionChart` (multi-line per-platform views)
- `HomeEngagementChart` (horizontal bar per-platform engagement)

`projectUuid` comes from `useFocusProjectStore` — the same store agency members use, seeded by `useSyncFocusedProject()` in `protected.tsx` from `GET /api/projects`. No project picker is rendered (clients only ever have one project). Data is fed by `useListIntegrations` + `useListIntegrationInsights`, and the time-period selector reuses the shared `useHomePeriodStore`. Layout is a single column (no `HomeScriptsPanel`, no right pane).

**Empty state — Connect CTA** (Phase 8): when `integrations.length === 0`, the page reuses the shared `ConnectIntegrationPlaceholder` with an explicit `projectUuid={focusedProjectUuid}` prop. The placeholder now accepts an optional `projectUuid` and dispatches `openForProject(projectUuid, Platform.Instagram)` when set (falling back to the agency-side `setSelectedPlatform` when omitted). This keeps a single Connect component used by both agency and client. In the populated state the page does not render its own Connect button — clients connect via the sidebar's platform tiles, matching the agency home (which also has no Connect button when integrations exist).

## Client contents page

`/client/contents` is rendered by `ClientContentsPage` ([routes/client/contents.tsx](../src/routes/client/contents.tsx)) — a thin adapter that reads `focusedProjectUuid` from `useFocusProjectStore` and renders the shared `ContentsPageView` with `isReadOnly` set. No new page-level component was introduced; the agency-side route at [routes/agency/contents.tsx](../src/routes/agency/contents.tsx) mounts the same `ContentsPageView` without the flag.

`isReadOnly` is propagated by `ContentsPageView` into `ContentListPanel` (hides the "New Group" button + skips the `CreateGroupModal` mount) and `ContentGroupDetailPanel` (hides the trash icon, "Unlink script" button, add-post `+` button, per-post remove buttons, and skips the `ConfirmDeleteDialog` / `PostPickerModal` mounts). `ContentPostDetailPanel` has no write surfaces so it stays untouched. Backend voters reject all writes regardless — the read-only flag is purely UX.

## Subscription gate

When a client's agency has no active subscription, every `/client/*` route is replaced by a "Access suspended — contact your agency" full-screen card (`ClientPortalLockedView`) that exposes only a Logout button.

The gate is enforced **on the backend**, not via a serialized boolean: `GET /api/projects/:uuid` throws `AgencySubscriptionInactiveException` (code `27003`, HTTP 403) when the requester is a `ROLE_CLIENT` user whose agency has no active subscription. `ClientShellLayout` calls `useShowProject(focusedProjectUuid)` on every render (the client sidebar already does, so React Query dedupes), and when the error carries code `27003` it short-circuits to `ClientPortalLockedView` before rendering any sidebar or outlet. Agency members are never gated, so they can still reach their billing settings to re-subscribe.

`useShowProject` sets `retry: false` so the lock screen renders immediately on the 403 instead of waiting for React Query's default exponential backoff.

## Client settings

`/client/settings/:section` reuses the same `SettingsPageView` component as the agency side — the view accepts a `basePath` prop so it builds nav links into the right shell. `SettingsPageView` already filters sections via `getSettingsSectionsForRoles(user.roles)`, which returns `[General]` for `ROLE_CLIENT`. Anything other than `:section === 'general'` redirects back to `clientSettingsGeneralPath`. The General section's `GeneralSettings` component (profile + password change) is reused unchanged.

## Invite token setup page

`/invite/:token` is public (no auth) and rendered by `InviteTokenPage` → `InviteSetupPageView`:

1. If a session already exists (`useCurrentUser` returns a user), the page refuses to render the setup form and instead shows a *"You're already signed in as `{email}` — sign out first"* screen with a Logout button (`useLogout`). This avoids overwriting an existing identity mid-flow.
2. Otherwise, `useShowInvitation(token)` fetches the invitation summary via the public `GET /api/invitations/:token` endpoint. Errors (29001 not found, 29002 expired, 29003 already used) are rendered inline through the same exception-code → translation map (`services/apiErrorHandler/errorCodeMessages.ts`) used everywhere else.
3. The header copy branches on `invitation.type`:
   - Client: *"Welcome to your `{agencyName}` portal"* with the heading + envelope icon — same MakerFlow chrome as every other auth surface (no per-agency theming).
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

- Per-role onboarding flows → Phase 9. In the meantime, `OnboardingCreateAgencyStep` (the first onboarding step) auto-advances on mount when `user.role === ROLE_CLIENT`, so clients never see an agency-creation prompt.
- Disconnecting integrations from the client portal — only agency members can revoke integrations from the agency UI (the role matrix grants clients connect-only access).
