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
| `front/src/models/enums/PostDraftStatus.ts` | `AwaitingReview`, `ChangesRequested`, `Approved`, `Archived` + translation keys. |
| `front/src/models/enums/PostDraftRevisionOptimizationStatus.ts` | `Pending`, `Optimizing`, `Optimized`, `Failed` + translation keys. |
| `front/src/models/enums/MediaType.ts` | Reused as-is (matches backend `Post.mediaType`). |

The list endpoint returns a per-row shape with `latestRevision` (single, summary) — `useListPostDrafts` adapts that into a one-element `revisions` array on the `PostDraft` model so the `latestRevision` getter keeps working uniformly across list and detail. The detail endpoint returns the full ordered `revisions` array.

## React Query hooks (`front/src/hooks/api/postDrafts/`)

| Hook | Endpoint | Notes |
|---|---|---|
| `useListPostDrafts({ projectUuid, page, limit })` | `GET /post-drafts` | Returns `{ items, total, page, limit }`. Disabled when `projectUuid` is null. |
| `useShowPostDraft({ uuid })` | `GET /post-drafts/{uuid}` | Polls every 4 s while any revision is `Pending` or `Optimizing`. |
| `useCreatePostDraft()` | `POST /post-drafts` | Builds `FormData` with one `files[]` entry per file. Invalidates the list. |
| `useUpdatePostDraft()` | `PATCH /post-drafts/{uuid}` | Invalidates list + detail. |
| `useDeletePostDraft()` | `DELETE /post-drafts/{uuid}` | Invalidates list, removes detail. |

Query keys live in `postDraftsQueryKeys.ts`.

## State

`front/src/stores/postDrafts/postDraftsStore.ts` — Zustand (resettable, not persisted):

```ts
{ selectedDraftUuid: string | null, isCreatePanelOpen: boolean }
+ selectDraft / openCreatePanel / closeCreatePanel / closeAll
```

The detail panel and the create panel are mutually exclusive — selecting a draft closes the create panel and vice versa.

## Components (`front/src/components/postDrafts/`)

| Component | Role |
|---|---|
| `PostDraftsPageView` | Orchestrator. Renders the list on the left + two side panels (detail, create) on the right, only one open at a time. |
| `PostDraftsList` | Header (title + "New draft" CTA) + scrollable list. Empty state with CTA. |
| `PostDraftListItem` | Single row: thumbnail (first optimized file when ready, or a media-type icon otherwise), title, status badge, mediaType + relative-updated-time, optimization label when in-flight. |
| `PostDraftDetailPanel` | Media viewer + metadata + inline edit form (title/description/notes/script). Edit is gated to `AwaitingReview`. Delete confirmation via `window.confirm`. |
| `PostDraftCreateForm` | Title / mediaType radio / files dropzone / description / notes / script selector / submit. Frontend validates file count + size + MIME before posting. Catches HTTP 409 → script-already-has-draft. |
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

Pre-flight validation runs in `PostDraftCreateForm.validate()`; backend re-validates and is authoritative.

## Stream endpoint behavior

`GET /api/post-drafts/revisions/{revisionUuid}/files/{index}` returns:
- `200` + the optimized file (Range requests work — useful for scrubbing in the `<video>` player).
- `204` when the file isn't on disk yet (optimization still in flight).

The detail panel polls the show endpoint every 4 s while any revision is `Pending` or `Optimizing`, then stops automatically.

## Out of scope (Phase 1)

- Client-side review page, approve / changes-requested actions, feedback thread — Phase 2 / 3.
- Re-uploading a new revision on the same draft — Phase 3.
- Backlink to a published Post — Phase 4.
