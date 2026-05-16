# Post Draft Feature (Frontend)

## Overview

Agency-side page at `/agency/drafts` for uploading content (video / image / carousel) and tracking client review status. UI label is "Drafts" / "Brouillons"; the underlying entities are `PostDraft` + `PostDraftRevision` (see `back/docs/post-draft-feature.md` for the data model).

Phase 1 ships the agency-side surface only. Clients have no visibility yet.

## Route + navigation

- Path: `agencyDraftsPath = '/agency/drafts'` (`front/src/routes/routePaths.ts`).
- Route file: `front/src/routes/agency/drafts.tsx` (uses `useSelectFocusedProject` to scope the page to the focused project, mirroring `/agency/contents`).
- Registered in `front/src/router.tsx` between `AgencyContentsPage` and `AgencyScriptsPage`.
- Sidebar nav entry: `NavigationItem.Drafts`, slotted between `Calendar` and `Contents` in `sidebarMainNavigationItems`. Icon: `DocumentDuplicateIcon` (Heroicons v2). Translation keys at `navigation:items.drafts` ("Drafts" / "Brouillons").

## Models + enums

| File | Purpose |
|---|---|
| `front/src/models/PostDraft.ts` | Class + `fromJSON` / `toJSON`. Exposes a `latestRevision` getter. The `script` field is a `Script` instance (reuses `front/src/models/Script.ts` — no separate summary type). |
| `front/src/models/PostDraftRevision.ts` | Class + serializers. |
| `front/src/models/enums/PostDraftStatus.ts` | `AwaitingReview`, `ChangesRequested`, `Approved`, `Rejected` + translation keys. |
| `front/src/models/enums/PostDraftRevisionOptimizationStatus.ts` | `Pending`, `Optimizing`, `Optimized`, `Failed` + translation keys. |
| `front/src/models/enums/MediaType.ts` | Reused as-is (matches backend `Post.mediaType`). |

The list endpoint returns a per-row shape with `latestRevision` (single, summary) — `useListPostDrafts` adapts that into a one-element `revisions` array on the `PostDraft` model so the `latestRevision` getter keeps working uniformly across list and detail. The detail endpoint returns the full ordered `revisions` array.

## React Query hooks (`front/src/hooks/api/postDrafts/`)

| Hook | Endpoint | Notes |
|---|---|---|
| `useListPaginatedPostDrafts({ projectUuid, limit, status?, searchTerm? })` | `GET /post-drafts` | `useInfiniteQuery` over pages of `limit` (default 20). Optional `status` and `searchTerm` are forwarded to the API only when truthy; the query key tracks them so React Query refetches when filters change. Disabled when `projectUuid` is null. |
| `useShowPostDraft({ uuid })` | `GET /post-drafts/{uuid}` | Polls every 4 s while any revision is `Pending` or `Optimizing`. |
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
| `PostDraftListItem` | Single row: thumbnail (first optimized file when ready, plain surface otherwise) with always-on type-icon overlay (bottom-right) + carousel `1/N` slide-count badge (top-right). Title, mediaType · relative-updated-time meta row, status pill, optimization label when in-flight. Active state uses the neutral `bg-clear-2 border-pale-gray shadow-sm` (no mint tint). |
| `PostDraftDetailPanel` | Media viewer + metadata + inline edit form (title/description/notes/script). Edit is gated to `AwaitingReview`. Delete confirmation via `window.confirm`. |
| `PostDraftCreateModal` | `ModalOverlay` (`w-160`, `max-h-[calc(100vh-80px)]`) hosting the create form inline (title / mediaType radio / files dropzone / description / notes / script selector / submit). Driven by `showModal` / `onClose` props. Frontend validates file count + size + MIME before posting. Catches HTTP 409 → script-already-has-draft. On success calls `selectDraft(uuid)` which auto-closes the panel. |
| `PostDraftFileDropzone` | Drag-drop area + per-file row with reorder (↑/↓) for carousel. Single-file for video/image. Wraps the design of `front/src/components/ui/FileUpload.tsx` but built inline so the shared `FileUpload` keeps its single-file contract. |
| `PostDraftMediaViewer` | `<video controls>` for video, single `<img>` for image, 2-column grid of `<img>`s for carousel. Shows a spinner while `optimizationStatus` is `Pending` / `Optimizing` and a danger message on `Failed`. |
| `PostDraftStatusBadge` | Pill with color tokens per status. |
| `postDraftStreamUrl(revisionUuid, index)` | Helper that builds the URL for the stream endpoint. Cookies are sent automatically by the browser on same-origin requests. |

## i18n

Namespace: `postDrafts` (`front/src/services/i18n/locales/postDrafts/{en,fr}.json`). Auto-registered by `services/i18n/i18n.ts` (glob-driven). Covers page chrome, status labels, optimization labels, form labels, validation messages, delete confirm.

The `navigation` namespace also has a `items.drafts` key in both languages.

## Upload constraints (mirror of the backend)

| Media type | Files | MIME | Max size |
|---|---|---|---|
| Video | 1 | `video/mp4`, `video/quicktime`, `video/webm` | 500 MB |
| Image | 1 | `image/png`, `image/jpeg`, `image/webp` | 20 MB |
| Carousel | 2–10 | `image/png`, `image/jpeg`, `image/webp` | 20 MB each |

Pre-flight validation runs in `PostDraftCreateModal` before submit; backend re-validates and is authoritative.

## Stream endpoint behavior

`GET /api/post-drafts/revisions/{revisionUuid}/files/{index}` returns:
- `200` + the optimized file (Range requests work — useful for scrubbing in the `<video>` player).
- `204` when the file isn't on disk yet (optimization still in flight).

The detail panel polls the show endpoint every 4 s while any revision is `Pending` or `Optimizing`, then stops automatically.

## Out of scope (Phase 1)

- Client-side review page, approve / changes-requested actions, feedback thread — Phase 2 / 3.
- Re-uploading a new revision on the same draft — Phase 3.
- Backlink to a published Post — Phase 4.
