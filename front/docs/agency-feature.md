# Agency Feature (Frontend)

## Overview

Phase 5 of the Client Portal + Agency Workspace rollout. Adds the UI an admin needs to operate their agency:

- **Agency settings** — edit the agency profile (name, contact email, website) and manage agency collaborators (active members + pending invitations) in a single section.
- **Per-project Clients** — embedded inside each `ProjectSettingsCard`; same actions scoped to a project.
- **Role-aware settings sidebar** — every section list is filtered by the current user's role via `getSettingsSectionsForRoles(roles)`.

No new top-level navigation entries are introduced — client management lives where it is naturally scoped (a project), not as a cross-agency view.

## Routes

All new section URLs are children of the existing `/agency/settings/:section` route registered in [src/routes/agency/settings.section.tsx](../src/routes/agency/settings.section.tsx). New constants in [src/routes/routePaths.ts](../src/routes/routePaths.ts):

| Constant | Path |
| --- | --- |
| `agencySettingsAgencyPath` | `/agency/settings/agency` |

The agency profile and collaborators management live together under `agencySettingsAgencyPath`. The existing `agencySettingsGeneralPath`, `agencySettingsProjectsPath`, `agencySettingsSubscriptionPath` are unchanged.

## Role-aware section list

[`SettingsSection`](../src/models/enums/SettingsSection.ts) exports `getSettingsSectionsForRoles(roles: UserRole[])` that gates each section:

| Role | Visible sections |
| --- | --- |
| `ROLE_ADMIN` | General, Agency, Projects, Subscription |
| `ROLE_EDITOR` | General, Projects |
| `ROLE_VIEWER` | General, Projects (read-only inside) |
| `ROLE_CLIENT` | General |

Two places consume the helper:

1. [SettingsPageView](../src/components/settings/SettingsPageView.tsx) — renders the side panel list.
2. [settings.section.tsx](../src/routes/agency/settings.section.tsx) — redirects to `/agency/settings/general` if the requested section is not in the role-permitted set, protecting deep-links.

## Components

### Agency settings — [src/components/settings/agency/AgencySettings.tsx](../src/components/settings/agency/AgencySettings.tsx)

Orchestrator component for the merged Agency section. Sticky page header (`Agency` + subtitle) sits above a single scrollable body that stacks two blocks:

1. [`AgencySettingsForm`](../src/components/settings/agency/AgencySettingsForm.tsx) — card-style form with a single **Brand identity** section: `AgencyLogo` (editable PNG upload) followed by inline-edit Name / Email / Website inputs. In-card right-aligned Save button visible only when `hasChanges`. Form state lives in [`useAgencySettingsForm`](../src/hooks/useAgencySettingsForm.ts); validation is delegated to [`validateAgencyForm`](../src/utils/agencyValidation.ts).
2. [`CollaboratorsSection`](../src/components/settings/agency/CollaboratorsSection.tsx) — flat block separated by a `border-t` divider. Header row with an `h3 "Collaborators"` and an "Invite collaborator" button, followed by the `DataTable<CollaboratorRow>` showing active collaborators then pending invitations.

The three collaborator modals (`InviteCollaboratorModal`, `RemoveCollaboratorModal`, `DeleteInvitationModal`) are rendered at the `AgencySettings` root and driven by [`collaboratorModalsStore`](../src/stores/collaborators/collaboratorModalsStore.ts).

Data:
- [`useCurrentAgency`](../src/hooks/api/agency/useCurrentAgency.ts) — `GET /agencies/current`. Mirrors the `useCurrentUser` naming for "the current user's [resource]".
- [`useUpdateAgency`](../src/hooks/api/agency/useUpdateAgency.ts) — `PATCH /agencies` (empty segment, matches the backend route shape). Mirrors `useUpdateUser`.
- [`useListCollaborators`](../src/hooks/api/collaborators/useListCollaborators.ts) — drives both the table rows and the modal "removing user" lookup.

### Agency logo — [src/components/agency/AgencyLogo.tsx](../src/components/agency/AgencyLogo.tsx)

Self-contained component covering both display and upload. Props: `{ agency: Agency; editable?: boolean; className?: string }`. The backend returns `204 No Content` when an agency has no logo, so the component owns the empty state.

Rendering matrix:

| `editable` | logo state | What renders |
| --- | --- | --- |
| any | loading | `Shimmer` |
| any | uploaded | `<img>` with the blob URL (object-cover) |
| `false` | missing | `AgencyLogoInitial` — colored block with the agency's first letter, tinted with `agency.accentColor` when it matches `HEX_COLOR_PATTERN`, otherwise a neutral `bg-light-gray` |
| `true` | missing | `AgencyLogoDropzone` — wraps the generic [`FileUpload`](../src/components/ui/FileUpload.tsx) with `accept="image/png"`, the `PhotoIcon`, and the `agencySettings:logo.*` translation keys. Click-to-browse and drag-and-drop are handled by `FileUpload` itself; this wrapper just bridges the agency hook with the generic UI. |

Client-side validation lives inside [`useUploadAgencyLogo`](../src/hooks/api/agency/useUploadAgencyLogo.ts) alongside the mutation — the component stays presentational. Checks (`file.type === "image/png"`, `file.size ≤ 5 MB`) mirror the backend and surface as `agencySettings:validation.logoMimeType` / `logoTooLarge` rendered below the drop zone. After a successful upload, the mutation invalidates `agencyQueryKeys.logo(uuid)` and the `<img>` renders automatically.

Call sites:
- [AgencySettings](../src/components/settings/agency/AgencySettings.tsx) — `editable` variant, `w-full max-w-md`.
- [DesktopSidebar](../src/components/sidebar/DesktopSidebar.tsx) — read-only, `size-8 rounded-md` next to the agency name above the project selector. Mobile sidebar inherits via `MobileSidebarShell`.
- [ClientDesktopSidebar](../src/components/client-portal/sidebar/ClientDesktopSidebar.tsx) — read-only, `size-8 rounded-md` next to the agency name. Mobile inherits the same way. Clients never see the drop zone (call sites enforce this, not the component).

### Collaborators section — [src/components/settings/agency/CollaboratorsSection.tsx](../src/components/settings/agency/CollaboratorsSection.tsx)

Embedded block rendered inside `AgencySettings`. `DataTable<CollaboratorRow>` listing active collaborators followed by pending invitations. Columns: Name, Email, Role pill, Status pill, Actions. The current user's own row shows a "You" indicator instead of action buttons.

Three modals open from row actions (rendered by the parent `AgencySettings`):
- `InviteCollaboratorModal` + `InviteCollaboratorForm` — fields: firstName, lastName, email, role (Editor / Viewer via Pill toggle). Calls `useInviteCollaborator`.
- `RemoveCollaboratorModal` — `ConfirmDeleteDialog` wrapper, calls `useRemoveCollaborator`.
- `DeleteInvitationModal` — shared with the per-project view, calls `useDeleteInvitation`.

Open/close state is held in [`collaboratorModalsStore`](../src/stores/collaborators/collaboratorModalsStore.ts) (Zustand) mirroring `createProjectModalStore`. The section component dispatches `setIsInviteOpen` / `setRemovingUserUuid` / `openDeleteInvitation`; the parent reads the open state to render the modals.

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
| `src/hooks/api/agency/` | `useCurrentAgency`, `useUpdateAgency`, `useShowAgencyLogo`, `useUploadAgencyLogo` (+ existing `useCreateAgency`) |
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

[`AnalyticsEvent`](../src/models/enums/AnalyticsEvent.ts) gains: `AgencySettingsUpdated`, `AgencyLogoUpdated`, `CollaboratorInvited`, `CollaboratorRemoved`, `ClientInvited`, `ClientRemoved`, `InvitationDeleted`. Each is emitted from the corresponding mutation hook's `onSuccess` callback.

## i18n

New namespaces under [src/services/i18n/locales/](../src/services/i18n/locales/) (auto-registered via `import.meta.glob` in [i18n.ts](../src/services/i18n/i18n.ts)):

- `agencySettings/{fr,en}.json` — Agency profile form copy.
- `collaborators/{fr,en}.json` — Collaborators table copy, invite form, role labels.
- `clients/{fr,en}.json` — Invite-client form copy.
- `invitations/{fr,en}.json` — Cancel-confirmation copy.

Extended namespaces:
- `settings/{fr,en}.json` — adds `sections.agency` and the per-project `projects.card.clients.*` subtree. `sections.collaborators` is reused as the `h3` label inside the merged Agency section.

## Theming

The app does not support per-agency theming. All surfaces use the MakerFlow design tokens declared in [`app.css`](../src/app.css)'s `@theme` block. Agencies carry identity fields (`name`, `contactEmail`, `website`, `logo`) but no color or font personalisation.

This is what makes the agency's "Body font" selection actually take effect — earlier the body classes used the display variable, which silently no-op'd the body-font setting.

## Related docs

- [client-portal-feature.md](client-portal-feature.md) — Phase 3 role-aware routing.
- [billing-feature.md](billing-feature.md) — Subscription section (now admin-only, role-gated by the same helper).
- [project-feature.md](project-feature.md) — Project hooks and modals reused as a pattern reference.
- [i18n-feature.md](i18n-feature.md) — locale file conventions.
- Backend: [back/docs/agency-feature.md](../../back/docs/agency-feature.md), [back/docs/invitation-feature.md](../../back/docs/invitation-feature.md).
