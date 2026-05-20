# Post Draft Feature (Frontend)

## Overview

Agency-side page at `/agency/drafts` for uploading content (video / image / carousel) and tracking client review status. UI label is "Drafts" / "Brouillons"; the underlying entities are `PostDraft` + `PostDraftMediaVersion` (see `back/docs/post-draft-feature.md` for the data model).

Phase 2 adds the client-side review surface at `/client/drafts`, where a `ROLE_CLIENT` user reviews each draft, approves it in one click, or opens a modal to send written feedback. See [Phase 2 — client review surface](#phase-2--client-review-surface) below.

## Route + navigation

- Path: `agencyDraftsPath = '/agency/drafts'` (`front/src/routes/routePaths.ts`).
- Route file: `front/src/routes/agency/drafts.tsx` (uses `useSelectFocusedProject` to scope the page to the focused project, mirroring `/agency/contents`).
- Registered in `front/src/router.tsx` between `AgencyContentsPage` and `AgencyScriptsPage`.
- Sidebar nav entry: `NavigationItem.Drafts`, slotted between `Calendar` and `Contents` in `sidebarMainNavigationItems`. Icon: `DocumentDuplicateIcon` (Heroicons v2). Translation keys at `navigation:items.drafts` ("Drafts" / "Brouillons").
- Cross-feature redirect: the draft detail panel's "From script" eyebrow link and side-card linked-script row open the script editor by calling `useFocusScriptStore().setFocusedScriptUuid(script.uuid)` and then `navigate(agencyScriptsPath)` — mirrors `HomeScriptsPanel`. No UUID is exposed in the URL; the script-list page picks the focused script up from the store.

## Models + enums

| File | Purpose |
|---|---|
| `front/src/models/PostDraft.ts` | Class + `fromJSON` / `toJSON`. Exposes a `latestMediaVersion` getter and a `currentStatus` getter (returns the latest version's status — Phase 2 moved `status` off the draft). The `script` field is a `Script` instance (reuses `front/src/models/Script.ts` — no separate summary type). |
| `front/src/models/PostDraftMediaVersion.ts` | Class + serializers. Carries `status: PostDraftStatus` and the `comments: PostDraftMediaVersionComment[]` thread for that version. |
| `front/src/models/PostDraftMediaVersionComment.ts` | Single comment row: `uuid`, `body`, `createdAt`, and an optional `author: User` (reuses the existing [`User` model](../src/models/User.ts) — no ad-hoc author type). Backend serializes the author with `uuid`, `firstName`, `lastName`, `email` via the `api_post_drafts_show` group. |
| `front/src/models/enums/PostDraftStatus.ts` | `AwaitingReview`, `ChangesRequested`, `Approved`, `Rejected` + translation keys, plus `postDraftStatusToBgClass` / `postDraftStatusToTextClass` / `postDraftStatusToBorderClass` / `postDraftStatusToIcon` / `postDraftStatusToBannerTitleKey` / `postDraftStatusToBannerSubtitleKey`. Call sites feed these maps into the generic `Tag` and `Banner` UI components. Mirrors the convention used in `ScriptGenerationStatus.ts`. |
| `front/src/models/enums/FileInvalidReason.ts` | Mirror of the shared backend enum (`missing_file`, `too_many_files`, `too_few_files`, `file_too_large`, `invalid_mime_type`, `invalid_payload`) + translation keys. Consumed by the 33001 and 27004 resolvers in `errorCodeMessages.ts` (via the local `resolveFileInvalidReason` helper) to surface the specific reason via `meta.reason`. |
| `front/src/models/enums/MediaType.ts` | Reused as-is (matches backend `Post.mediaType`). |

The list endpoint returns a per-row shape with `latestMediaVersion` (single, summary) — `useListPostDrafts` adapts that into a one-element `mediaVersions` array on the `PostDraft` model so the `latestMediaVersion` getter keeps working uniformly across list and detail. The detail endpoint returns the full ordered `mediaVersions` array.

## React Query hooks (`front/src/hooks/api/postDrafts/`)

| Hook | Endpoint | Notes |
|---|---|---|
| `useListPaginatedPostDrafts({ projectUuid, limit, status?, searchTerm? })` | `GET /post-drafts` | `useInfiniteQuery` over pages of `limit` (default 20). Optional `status` and `searchTerm` are forwarded to the API only when truthy; the query key tracks them so React Query refetches when filters change. Disabled when `projectUuid` is null. |
| `useShowPostDraft({ uuid })` | `GET /post-drafts/{uuid}` | One-shot fetch — files are stored as-is, no optimization polling. |
| `useCreatePostDraft()` | `POST /post-drafts` | Builds `FormData` with one `files[]` entry per file. Invalidates the list. |
| `useUpdatePostDraft()` | `PATCH /post-drafts/{uuid}` | Invalidates list + detail. |
| `useDeletePostDraft()` | `DELETE /post-drafts/{uuid}` | Invalidates list, removes detail. |
| `useApprovePostDraftMediaVersion()` | `POST /post-draft-media-versions/{mediaVersionUuid}/approve` | Client-only. Takes `{ mediaVersionUuid, postDraftUuid, projectUuid }`. Response is the full updated `PostDraft` — written directly into the detail cache via `setQueryData` to avoid a refetch flicker; the list is invalidated. |
| `useRequestChangesOnPostDraftMediaVersion()` | `POST /post-draft-media-versions/{mediaVersionUuid}/request-changes` | Client-only. Same input plus `comment: string`. Same response shape and cache strategy. |
| `useCreatePostDraftMediaVersionComment()` | `POST /post-draft-media-versions/{mediaVersionUuid}/comments` | **Used by both surfaces** (agency replies + client follow-up comments). Same input shape as request-changes. Does not change status. Powers the shared `PostDraftCommentComposer`. |

Query keys live in `postDraftsQueryKeys.ts`.

## State

Two stores under `front/src/stores/postDrafts/`:

`postDraftsStore.ts` — Zustand (resettable, not persisted):

```ts
{ selectedDraftUuid: string | null, isCreatePanelOpen: boolean }
+ selectDraft / openCreatePanel / closeCreatePanel / closeAll
```

`selectDraft(uuid)` closes the create modal so the modal never sits over a newly-clicked detail. `openCreatePanel()` no longer clears `selectedDraftUuid` — the previously-selected draft stays visible behind the modal backdrop, and dismissing the modal returns the user to where they were.

`postDraftFilterStore.ts` — Zustand (resettable, persisted with `persist` middleware under key `app:postDrafts:filter`, partialized to **`selectedStatus` only** — search term is intentionally session-scoped):

```ts
{ selectedStatus: PostDraftStatus | null, searchTerm: string }
+ setSelectedStatus / setSearchTerm
```

`selectedStatus === null` means "All" — the chip filter omits the `status` query param so the API returns every status. Mirrors `useScriptFilterStore`.

## Components (`front/src/components/agency/postDrafts/`)

| Component | Role |
|---|---|
| `PostDraftsPageView` | Orchestrator. Two-region layout: persistent left list (`w-75` ≈ 300 px, `border-r border-pale-gray`) + scrollable `<main>` that renders `PostDraftDetailPanel` when a draft is selected, otherwise a centered empty state (`emptyState.noSelection.*`). The create flow is rendered above the layout via `PostDraftCreateModal`. |
| `PostDraftsList` | Fixed toolbar (SearchBar with Cmd/Ctrl+F focus shortcut + row of status filter chips: `All / Awaiting / Changes / Approved / Rejected`) + scrollable list with infinite scroll. Empty state differentiates "no drafts yet" (with "New draft" CTA) from "no matches" (when a search/status filter is active). Filtering is server-side via the extended `useListPaginatedPostDrafts`. |
| `PostDraftListItem` | Single row: thumbnail (first stored file) with always-on type-icon overlay (bottom-right) + carousel `1/N` slide-count badge (top-right). Title, mediaType · relative-updated-time meta row, status `Tag` (generic UI component fed with `postDraftStatusTo*` maps). Active state uses the neutral `bg-clear-2 border-pale-gray shadow-sm` (no mint tint). |
| `PostDraftDetailPanel` | Thin composition. Loading guard → `LoadedPostDraftDetailPanel` once `postDraft` is non-null. Wires `usePostDraftEditForm` (form state), `useDeletePostDraft`, and the delete-confirm dialog; then renders the generic `Banner` (driven by `postDraftStatusToBanner*` / `postDraftStatusTo*` enum maps) followed by `PostDraftDetailHeader` / `PostDraftMediaViewer` / `PostDraftDetailBody` / `PostDraftDetailSideCard` inside a single `<form>` whose `onSubmit` calls `form.submit()` (no-op when `!hasChanges`). |
| `PostDraftDetailHeader` | Eyebrow row (`{type icon} {type label} · v{n} · {relative date} · From script · {title}`) + title (`Input simple` when editable, `<h1>` otherwise) + action cluster (animated Save + Delete). The Save button is gated by `useDelayedUnmount(form.hasChanges, 200)` so it can play `animate-fade-out` (defined in `app.css`) before unmounting. The "From script" link is hidden in edit mode since the `LinkedScriptField` in the body is the source of truth then. |
| `PostDraftDetailBody` | Left column of the metadata grid: description + dashed-callout client-notes + linked-script field. Each section flips between `TextArea simple` and plain text based on `form.canEdit`. The linked-script field only renders while editable and is the shared [`LinkedScriptField`](../src/components/agency/scripts/LinkedScriptField.tsx) — a tile with `Change` / `×` actions that opens [`ScriptPickerModal`](../src/components/agency/scripts/ScriptPickerModal.tsx) (search + status chips + paginated list). See [script-picker-feature.md](script-picker-feature.md). |
| `PostDraftDetailSideCard` | Right column: type / status / (linked script, when an `onLinkedScriptClick` handler is supplied) / uploaded / updated rows. Status renders the generic `Tag` driven by `postDraftStatusTo*` maps. The parent hides the linked-script row in edit mode by passing `undefined`. The `SideCardRow` helper is local to this file. |
| `PostDraftCreateModal` | `ModalOverlay` (`w-160`, `max-h-[calc(100vh-80px)]`) hosting the create form in three regions: a **header** (modal title + subtitle, bottom-bordered), a **scrollable body** (content-type cards → file dropzone → title → description + hint → notes + hint → linked-script field), and a **sticky footer** on `bg-clear-2` holding Cancel + Submit. Content-type cards are two-line: icon + label on top, per-type constraint hint below (`form.mediaType{Video,Image,Carousel}Hint`); the selected card flips to `bg-clear border-dark shadow-sm`. Driven by `showModal` / `onClose` props. The linked-script field is the shared [`LinkedScriptField`](../src/components/agency/scripts/LinkedScriptField.tsx); when its picker is open the create modal slides to `align="left-of-center"` and the picker opens to `right-of-center` so both are visible side-by-side — see [script-picker-feature.md](script-picker-feature.md). Frontend validates file count + size + MIME before posting. Catches HTTP 409 → script-already-has-draft. On success calls `selectDraft(uuid)` which auto-closes the panel. |
| `PostDraftFileDropzone` | Drag-drop area + per-file row with reorder (↑/↓) for carousel. Single-file for video/image. Renders the dropzone surface via `FileUpload`'s `children` render-prop (large `border-2 border-dashed` panel on `bg-clear-2`, flipping to `border-primary bg-primary/5 text-primary` on hover/drag) so the local restyle stays self-contained and doesn't affect other consumers of `FileUpload`. |
| `PostDraftMediaViewer` *(shared — `~/components/postDrafts/`)* | Tiny dispatcher consumed by both the agency `PostDraftDetailPanel` and (future) the client view. Switches on `mediaType` and delegates to `PostDraftVideoViewer` / `PostDraftImageViewer` / `PostDraftCarouselViewer`. |
| `PostDraftVideoViewer` *(shared)* | `rounded-2xl bg-dark` framed video. Native `<video controls preload="metadata">` capped at `max-h-[70vh]`, plus a `bg-clear-3` footer showing the media-type label and the duration (read client-side via `loadedmetadata`, formatted `m:ss`). Owns its own data fetching via `useShowPostDraftMediaVersionFile(mediaVersionUuid, 1)` — renders a small spinner inside the dark frame while the blob downloads. |
| `PostDraftImageViewer` *(shared)* | `rounded-2xl bg-dark` framed single image with `object-contain` (preserves native aspect, capped at `max-h-[70vh]`). Owns its own data fetching via `useShowPostDraftMediaVersionFile(mediaVersionUuid, 1)`. |
| `PostDraftCarouselViewer` *(shared)* | Stateful active-slide viewer inside the `rounded-2xl bg-dark` frame: left/right arrow buttons (disabled at the ends), top-right slide counter, dot indicators, and a `bg-clear-3` thumbnail strip (thumbs use `object-cover`, active thumb has a `border-dark` ring). Renders one private `CarouselSlideImage` per slide for both the active frame and each thumb — React Query dedupes via the `mediaVersionFile` query key so each file is fetched once. |
| `useShowPostDraftMediaVersionFile(mediaVersionUuid, index)` | React Query hook that fetches a stored upload as a blob via `httpClient` (`GET /post-draft-media-versions/files?mediaVersionUuid=&index=`) and exposes a `fileUrl` (an `URL.createObjectURL` blob URL, revoked on unmount). Same pattern as `useShowPostThumbnail` / `useShowAgencyLogo`. Backing query key: `postDraftsQueryKeys.mediaVersionFile(mediaVersionUuid, index)`. |
| `useShowPostDraftMediaVersionStream(mediaVersionUuid, path)` | Sibling hook that fetches a single HLS artifact as a blob (`GET /post-draft-media-versions/stream?mediaVersionUuid=&path=`). Same blob-URL contract. Backing query key: `postDraftsQueryKeys.mediaVersionStream(mediaVersionUuid, path)`. |

## i18n

Namespace: `postDrafts` (`front/src/services/i18n/locales/postDrafts/{en,fr}.json`). Auto-registered by `services/i18n/i18n.ts` (glob-driven). Covers page chrome, status labels, form labels, validation messages, delete confirm.

The create modal pulls its chrome and content-type hints from the `form` namespace: `form.modalTitle`, `form.modalSubtitle`, `form.mediaType{Video,Image,Carousel}Hint`, `form.descriptionHint`, and `form.notesHint`.

The `navigation` namespace also has a `items.drafts` key in both languages.

## Upload constraints (mirror of the backend)

| Media type | Files | MIME | Max size |
|---|---|---|---|
| Video | 1 | `video/mp4`, `video/quicktime`, `video/webm` | 500 MB |
| Image | 1 | `image/png`, `image/jpeg`, `image/webp` | 20 MB |
| Carousel | 2–10 | `image/png`, `image/jpeg`, `image/webp` | 20 MB each |

Pre-flight validation runs in `PostDraftCreateModal` before submit; backend re-validates and is authoritative.

## Stream endpoint behavior

Two flat top-level routes on the backend, both driven by query-param DTOs — see `back/docs/post-draft-feature.md` for the full contract:

- `GET /api/post-draft-media-versions/files?mediaVersionUuid=&index=N` — returns the stored upload at `{index}.{ext}` (extension globbed). Used by `useShowPostDraftMediaVersionFile` (axios `params: { mediaVersionUuid, index }`) for image / carousel / pre-transcode video. Range requests work — useful for scrubbing in the `<video>` player.
- `GET /api/post-draft-media-versions/stream?mediaVersionUuid=&path=…` — HLS artifacts under the media version's `stream/` directory. `path` is `master.m3u8`, `1080p/index.m3u8`, `720p/segment_001.ts`, etc. Only `.m3u8` and `.ts` accepted. Used by `useShowPostDraftMediaVersionStream` (same shape as the file hook, blob-returning) once `videoStreamingStatus === ready`. Full HLS player wiring (hls.js for Chromium/Firefox, native for Safari) is a follow-up task — the current video viewer still hits the file hook with `index=1`, which 404s after transcoding succeeds.

Both routes return `404` when the file is missing (maps to `MissingPostDraftException`).

## Phase 2 — client review surface

A read-only / action surface at `/client/drafts` for `ROLE_CLIENT` users. The agency-side surface is unchanged, but reads status through the new model getter `postDraft.currentStatus` (= `latestMediaVersion.status`).

### Route + navigation

- Path: `clientDraftsPath = '/client/drafts'` (`front/src/routes/routePaths.ts`).
- Route file: `front/src/routes/client/drafts.tsx` (mirrors the agency entry — `useSelectFocusedProject` + `ClientPostDraftsPageView`).
- Registered in `front/src/router.tsx` next to `ClientHomePage` and `ClientContentsPage`.
- Sidebar nav entry added directly in `ClientDesktopSidebar.tsx` (the client sidebar does not consume `NavigationItem`) between Home and Contents. Icon: `DocumentDuplicateIcon` (outline / solid variants), label from `navigation:items.drafts`.

### State

The client view reuses the existing shared Zustand stores under `front/src/stores/postDrafts/`:

- `postDraftsStore.ts` — `selectedDraftUuid` is the only field the client surface reads. `isCreatePanelOpen` exists for the agency view and is ignored by client code.
- `postDraftFilterStore.ts` — `selectedStatus` + `searchTerm`. Persistence key (`app:postDrafts:filter`) is shared; since a user is either agency or client (never both), there's no cross-role state contamination.

The request-changes modal's open state is local to `ClientPostDraftDetailPanel` via `useState` — no need to leak that purely-client UI state into the shared store.

### Shared components (`front/src/components/postDrafts/`)

The list + layout + comments primitives are role-agnostic and live in the shared folder. Agency and client surfaces compose them via thin wrappers.

| Component | Role |
|---|---|
| `PostDraftsLayout` | Two-region shell: left list (`w-75 border-r border-pale-gray`) + `<main>` that renders either the caller-supplied `detail` slot or the centered "select a draft" empty state. Takes an optional `onCreateDraft` callback (agency only) that wires the CTA in the list's empty state. |
| `PostDraftsList` | Toolbar (`SearchBar` with `Cmd/Ctrl+F` shortcut + row of status `FilterChip`s) + infinite-scroll list driven by `useListPaginatedPostDrafts`. Reads selection + filters from the shared `usePostDraftsStore` / `usePostDraftFilterStore`. When `onCreateDraft` is provided, the empty state renders a primary CTA. |
| `PostDraftListItem` | Visual row — thumbnail with type-icon overlay + carousel slide-count badge, title, type + relative-updated meta, status `Tag` driven by `postDraft.currentStatus`. Identical between roles — agency-side edit / delete affordances live in the detail panel, never here. |
| `PostDraftMediaViewer` + `PostDraftVideoViewer` / `PostDraftImageViewer` / `PostDraftCarouselViewer` | Already shared in Phase 1; reused unchanged. |
| `PostDraftCommentsTimeline` | Vertical timeline of all media versions (latest first + expanded, older collapsed). Each row labels `Version N · Uploaded on {date} · {count} comment(s)`. Expanded rows list `PostDraftCommentItem` entries sorted ascending and, **on the latest version only**, mount a `PostDraftCommentComposer` so both agency and client can reply on the active thread. |
| `PostDraftCommentItem` | Single comment card: `comment.author?.fullName` (falls back to `postDrafts:comments.unknownAuthor`) · short date + body (`whitespace-pre-wrap`). |
| `PostDraftCommentComposer` | `TextArea` (3 rows, max 5000 chars, trimmed) + Send button. Calls `useCreatePostDraftMediaVersionComment` with the latest version's UUID. Empty-on-submit / too-long inline error; success/error toasts. Clears on success. Used by both surfaces. |

### Agency-only components (`front/src/components/agency/postDrafts/`)

| Component | Role |
|---|---|
| `PostDraftsPageView` | Thin orchestrator: `<PostDraftsLayout onCreateDraft={openCreatePanel} detail={<PostDraftDetailPanel />} … />` + `CreatePostDraftModal` mounted alongside. |
| `PostDraftDetailPanel` | Edit-aware orchestrator: loading guard → status `Banner` → editable header (`PostDraftDetailHeader`) → shared `PostDraftMediaViewer` → editable body (`PostDraftDetailBody`) + side card (`PostDraftDetailSideCard`) → shared `PostDraftCommentsTimeline` → `ConfirmDeleteDialog`. The form-state hook drives Save / Delete; the comments timeline lets the agency reply to client feedback inline. |
| `PostDraftDetailHeader` | Eyebrow + editable title (`Input simple` when `form.canEdit`, `<h1>` otherwise) + animated Save / Delete cluster. |
| `PostDraftDetailBody` | Description + dashed-callout notes + `LinkedScriptField` (latter only in edit mode); each section flips between `TextArea simple` and plain text based on `form.canEdit`. |
| `PostDraftDetailSideCard` | Type / status / (linked script, when an `onLinkedScriptClick` handler is supplied) / uploaded / updated rows. |
| `CreatePostDraftModal` + `PostDraftFileDropzone` | Agency-only create flow. |

### Client-only components (`front/src/components/client/postDrafts/`)

| Component | Role |
|---|---|
| `ClientPostDraftsPageView` | Thin wrapper: `<PostDraftsLayout detail={<ClientPostDraftDetailPanel />} … />`. No create modal. |
| `ClientPostDraftDetailPanel` | Status `Banner` → `ClientPostDraftDetailHeader` → shared `PostDraftMediaViewer` → `ClientPostDraftDetailBody` + `ClientPostDraftDetailSideCard` → `ClientPostDraftActionsBar` → shared `PostDraftCommentsTimeline`. Hosts `ClientPostDraftRequestChangesModal`. Approve fires via `useApprovePostDraftMediaVersion`. |
| `ClientPostDraftDetailHeader` | Read-only eyebrow + title (no edit input, no action cluster). |
| `ClientPostDraftDetailBody` | Read-only description + dashed-callout notes. |
| `ClientPostDraftDetailSideCard` | Read-only side card: type, status, uploaded / updated dates. |
| `ClientPostDraftActionsBar` | Status-driven button row (`AwaitingReview` → Approve + Request changes; `Approved` → Request changes only; `ChangesRequested` → read-only "Waiting for the agency to upload a new version" message; `Rejected` → renders nothing). |
| `ClientPostDraftRequestChangesModal` | `ModalOverlay` with required `TextArea` + Cancel / Submit footer. Calls `useRequestChangesOnPostDraftMediaVersion`. |

### i18n

- `postDrafts` namespace gains a `comments.*` block (timeline title, version label, uploaded-on, pluralized comment count, no-comments fallback, unknown-author fallback, composer placeholder / submit / inline errors / toasts). Used by both surfaces via the shared timeline + composer.
- `clientPostDrafts` namespace covers what's truly client-only: page chrome (no-selection empty state), action labels + waiting message, request-changes modal copy, approve/request-changes toasts.

Error code map (`front/src/services/apiErrorHandler/errorCodeMessages.ts`): direct one-to-one mappings for the six new exception codes — `33008` → `errors:postDraft.notAwaitingReview`, `33009` → `errors:postDraft.notAwaitingReviewOrApproved`, `33010` → `errors:postDraft.notLatestVersion`, `33011` → `errors:postDraft.commentEmpty`, `33012` → `errors:postDraft.commentTooLong`, `33013` → `errors:postDraft.commentPayloadInvalid`. No resolver functions — each error has a single user-facing message (matches the project convention: one exception per error condition).

## Out of scope (Phase 2)

- Agency-side feedback inbox / unread badge / per-version thread surfacing — Phase 3.
- Re-uploading a new media version on the same draft — Phase 3.
- Backlink to a published Post — Phase 4.
- Subscription-tier gating on version history — Phase 5.
