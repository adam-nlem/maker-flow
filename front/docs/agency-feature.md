# Agency Feature (Frontend)

## Overview

Phase 5 of the Client Portal + Agency Workspace rollout. Adds the UI an admin needs to operate their agency:

- **Agency settings** — edit the agency profile (name, brand color, contact email, website).
- **Collaborators settings** — list active members + pending invitations; invite, remove, cancel.
- **Per-project Clients** — embedded inside each `ProjectSettingsCard`; same actions scoped to a project.
- **Role-aware settings sidebar** — every section list is filtered by the current user's role via `getSettingsSectionsForRoles(roles)`.

No new top-level navigation entries are introduced — client management lives where it is naturally scoped (a project), not as a cross-agency view.

## Routes

All three new section URLs are children of the existing `/agency/settings/:section` route registered in [src/routes/agency/settings.section.tsx](../src/routes/agency/settings.section.tsx). New constants in [src/routes/routePaths.ts](../src/routes/routePaths.ts):

| Constant | Path |
| --- | --- |
| `agencySettingsAgencyPath` | `/agency/settings/agency` |
| `agencySettingsCollaboratorsPath` | `/agency/settings/collaborators` |

The existing `agencySettingsGeneralPath`, `agencySettingsProjectsPath`, `agencySettingsSubscriptionPath` are unchanged.

## Role-aware section list

[`SettingsSection`](../src/models/enums/SettingsSection.ts) exports `getSettingsSectionsForRoles(roles: UserRole[])` that gates each section:

| Role | Visible sections |
| --- | --- |
| `ROLE_ADMIN` | General, Agency, Collaborators, Projects, Subscription |
| `ROLE_EDITOR` | General, Projects |
| `ROLE_VIEWER` | General, Projects (read-only inside) |
| `ROLE_CLIENT` | General |

Two places consume the helper:

1. [SettingsPageView](../src/components/settings/SettingsPageView.tsx) — renders the side panel list.
2. [settings.section.tsx](../src/routes/agency/settings.section.tsx) — redirects to `/agency/settings/general` if the requested section is not in the role-permitted set, protecting deep-links.

## Components

### Agency settings — [src/components/settings/agency/AgencySettings.tsx](../src/components/settings/agency/AgencySettings.tsx)

Form section mirroring the structural shell of `GeneralSettings` (sticky header, scrollable body, sticky save footer that only appears when `hasChanges`).

Fields: `name` (required), `brandColor` (hex regex `^#[0-9A-Fa-f]{6}$` with a swatch preview), `contactEmail`, `website`. Validation regex mirrors the backend `Assert\Regex` on `Agency.brandColor`.

Data:
- [`useCurrentAgency`](../src/hooks/api/agency/useCurrentAgency.ts) — `GET /agencies/current`. Mirrors the `useCurrentUser` naming for "the current user's [resource]".
- [`useUpdateAgency`](../src/hooks/api/agency/useUpdateAgency.ts) — `PATCH /agencies` (empty segment, matches the backend route shape). Mirrors `useUpdateUser`.

### Collaborators settings — [src/components/settings/collaborators/CollaboratorsSettings.tsx](../src/components/settings/collaborators/CollaboratorsSettings.tsx)

`DataTable<CollaboratorRow>` listing active collaborators followed by pending invitations. Columns: Name, Email, Role pill, Status pill, Actions. The current user's own row shows a "You" indicator instead of action buttons.

Three modals open from row actions:
- `InviteCollaboratorModal` + `InviteCollaboratorForm` — fields: firstName, lastName, email, role (Editor / Viewer via Pill toggle). Calls `useInviteCollaborator`.
- `RemoveCollaboratorModal` — `ConfirmDeleteDialog` wrapper, calls `useRemoveCollaborator`.
- `DeleteInvitationModal` — shared with the per-project view, calls `useDeleteInvitation`.

Open/close state is held in [`collaboratorModalsStore`](../src/stores/collaborators/collaboratorModalsStore.ts) (Zustand) mirroring `createProjectModalStore`.

### Per-project Clients — [src/components/settings/project/ProjectSettingsCard.tsx](../src/components/settings/project/ProjectSettingsCard.tsx)

Each project card now has a Clients subsection at the bottom rendering a compact `<ul>` of active clients and pending invitations. The list is loaded via [`useListProjectClients(projectUuid)`](../src/hooks/api/projectClients/useListProjectClients.ts). Editor+ users see:
- A small "Invite a client" button in the section header → opens `InviteClientModal`.
- A trash icon per active row → opens an inline `ConfirmDeleteDialog` → calls `useRemoveClient`.
- An X icon per pending row → opens the shared `DeleteInvitationModal` → calls `useDeleteInvitation`.

Viewer-only users see the list but no action affordances. Modal state is local to the card (`useState`), since modals only matter on the active card.

### Shared delete-invitation modal — [src/components/invitations/DeleteInvitationModal.tsx](../src/components/invitations/DeleteInvitationModal.tsx)

Thin `ConfirmDeleteDialog` wrapper used by both the Collaborators table and each project's Clients list.

## React Query hooks

| Folder | Hooks |
| --- | --- |
| `src/hooks/api/agency/` | `useCurrentAgency`, `useUpdateAgency` (+ existing `useCreateAgency`) |
| `src/hooks/api/collaborators/` | `useListCollaborators`, `useInviteCollaborator`, `useRemoveCollaborator` |
| `src/hooks/api/projectClients/` | `useListProjectClients`, `useInviteClient`, `useRemoveClient` |
| `src/hooks/api/invitations/` | `useDeleteInvitation` |

Each folder follows the established `*QueryKeys.ts` + one-file-per-mutation pattern (see [project-feature.md](project-feature.md) for the canonical shape).

Both invite endpoints go through the polymorphic backend route `POST /api/invitations`. The `useDeleteInvitation` mutation invalidates both `collaboratorQueryKeys.all` and `projectClientQueryKeys.all` so any visible pending row refreshes wherever it lives.

## Models

- [`Invitation`](../src/models/Invitation.ts) — TypeScript class matching `api_invitations_list` (uuid, email, firstName, lastName, role, expiresAt, createdAt). The polymorphic `type` field belongs to the `api_invitation_show` group and will be re-introduced on the FE in Phase 6 when the public invite-setup page consumes that endpoint.
- [`InvitationType`](../src/models/enums/InvitationType.ts) — `Collaborator` / `Client` (kept on the FE for the invite mutations' request payloads).
- [`User`](../src/models/User.ts) exposes `roles: UserRole[]` (matches the backend's `api_user_me` group). Role-tier checks go through `user.hasRole(UserRole.Admin)` / `user.isClient`; the highest-precedence role is available via `user.displayRole` for display.

## Analytics

[`AnalyticsEvent`](../src/models/enums/AnalyticsEvent.ts) gains: `AgencySettingsUpdated`, `CollaboratorInvited`, `CollaboratorRemoved`, `ClientInvited`, `ClientRemoved`, `InvitationDeleted`. Each is emitted from the corresponding mutation hook's `onSuccess` callback.

## i18n

New namespaces under [src/services/i18n/locales/](../src/services/i18n/locales/) (auto-registered via `import.meta.glob` in [i18n.ts](../src/services/i18n/i18n.ts)):

- `agencySettings/{fr,en}.json` — Agency profile form copy.
- `collaborators/{fr,en}.json` — Collaborators table copy, invite form, role labels.
- `clients/{fr,en}.json` — Invite-client form copy.
- `invitations/{fr,en}.json` — Cancel-confirmation copy.

Extended namespaces:
- `settings/{fr,en}.json` — adds `sections.agency`, `sections.collaborators`, and the per-project `projects.card.clients.*` subtree.

## Related docs

- [client-portal-feature.md](client-portal-feature.md) — Phase 3 role-aware routing.
- [billing-feature.md](billing-feature.md) — Subscription section (now admin-only, role-gated by the same helper).
- [project-feature.md](project-feature.md) — Project hooks and modals reused as a pattern reference.
- [i18n-feature.md](i18n-feature.md) — locale file conventions.
- Backend: [back/docs/agency-feature.md](../../back/docs/agency-feature.md), [back/docs/invitation-feature.md](../../back/docs/invitation-feature.md).
