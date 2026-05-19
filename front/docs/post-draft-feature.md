# Post Draft Feature (Frontend)

## Overview

Agency-side page at `/agency/drafts` for uploading content (video / image / carousel) and tracking client review status. UI label is "Drafts" / "Brouillons"; the underlying entities are `PostDraft` + `PostDraftMediaVersion` (see `back/docs/post-draft-feature.md` for the data model).

Phase 1 ships the agency-side surface only. Clients have no visibility yet.

## Route + navigation

- Path: `agencyDraftsPath = '/agency/drafts'` (`front/src/routes/routePaths.ts`).
- Route file: `front/src/routes/agency/drafts.tsx` (uses `useSelectFocusedProject` to scope the page to the focused project, mirroring `/agency/contents`).
- Registered in `front/src/router.tsx` between `AgencyContentsPage` and `AgencyScriptsPage`.
- Sidebar nav entry: `NavigationItem.Drafts`, slotted between `Calendar` and `Contents` in `sidebarMainNavigationItems`. Icon: `DocumentDuplicateIcon` (Heroicons v2). Translation keys at `navigation:items.drafts` ("Drafts" / "Brouillons").
- Cross-feature redirect: the draft detail panel's "From script" eyebrow link and side-card linked-script row open the script editor by calling `useFocusScriptStore().setFocusedScriptUuid(script.uuid)` and then `navigate(agencyScriptsPath)` — mirrors `HomeScriptsPanel`. No UUID is exposed in the URL; the script-list page picks the focused script up from the store.

## Models + enums

| File | Purpose |
|---|---|
| `front/src/models/PostDraft.ts` | Class + `fromJSON` / `toJSON`. Exposes a `latestMediaVersion` getter. The `script` field is a `Script` instance (reuses `front/src/models/Script.ts` — no separate summary type). |
| `front/src/models/PostDraftMediaVersion.ts` | Class + serializers. |
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
| `useShowPostDraftMediaVersionFile(mediaVersionUuid, index)` | React Query hook that fetches a media-version file as a blob via `httpClient` and exposes a `fileUrl` (an `URL.createObjectURL` blob URL, revoked on unmount). Same pattern as `useShowPostThumbnail` / `useShowAgencyLogo`. Backing query key: `postDraftsQueryKeys.mediaVersionFile(mediaVersionUuid, index)`. |

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

`GET /api/post-draft-media-versions/{mediaVersionUuid}/files/{index}` returns:
- `200` + the stored file (Range requests work — useful for scrubbing in the `<video>` player).
- `404` when the index is out of range or the file is missing on disk (maps to `MissingPostDraftException`).

## Out of scope (Phase 1)

- Client-side review page, approve / changes-requested actions, feedback thread — Phase 2 / 3.
- Re-uploading a new media version on the same draft — Phase 3.
- Backlink to a published Post — Phase 4.
