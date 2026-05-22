# Review Feature (Frontend)

## Overview

Agency-side page at `/agency/reviews` for uploading content (video / image / carousel) and tracking client review status. UI label is "Drafts" / "Brouillons"; the underlying entities are `Review` + `ReviewVersion` (see `back/docs/review-feature.md` for the data model).

Phase 2 adds the client-side review surface at `/client/reviews`, where a `ROLE_CLIENT` user reviews each draft, approves it in one click, or opens a modal to send written feedback. See [Phase 2 — client review surface](#phase-2--client-review-surface) below.

## Route + navigation

- Path: `agencyReviewsPath = '/agency/reviews'` (`front/src/routes/routePaths.ts`).
- Route file: `front/src/routes/agency/reviews.tsx` (uses `useSelectFocusedProject` to scope the page to the focused project, mirroring `/agency/contents`).
- Registered in `front/src/router.tsx` between `AgencyContentsPage` and `AgencyScriptsPage`.
- Sidebar nav entry: `NavigationItem.Reviews`, slotted between `Calendar` and `Contents` in `sidebarMainNavigationItems`. Icon: `DocumentDuplicateIcon` (Heroicons v2). Translation keys at `navigation:items.reviews` ("Drafts" / "Brouillons").
- Cross-feature redirect: the draft detail panel's "From script" eyebrow link and side-card linked-script row open the script editor by calling `useFocusScriptStore().setFocusedScriptUuid(script.uuid)` and then `navigate(agencyScriptsPath)` — mirrors `HomeScriptsPanel`. No UUID is exposed in the URL; the script-list page picks the focused script up from the store.

## Models + DTOs + enums

The Review-shaped API endpoints all return the wrapper shape `{ review, latestVersion }` (mirroring the backend `ReviewWithLatestVersionResponseDTO`). Per the project convention (see `front/docs/coding-style.md`, "DTOs" section), wrapper shapes live under `front/src/dtos/{domain}/` as classes, while pure entity models stay under `front/src/models/`.

| File | Purpose |
|---|---|
| `front/src/dtos/reviews/ReviewWithLatestVersionDTO.ts` | Response wrapper. `{ review: Review, latestVersion: ReviewVersion \| null }` + `fromJSON`. `currentStatus` getter derives from `latestVersion?.status`. This is what every Review-shaped React Query hook returns. Mirrors the `PostWithPlatformAndInsightsDTO` pattern. Consumers receive it as a prop named **`reviewDTO`** (matching the `postDTO` naming used by `ContentPostCard`) — access entity fields via `reviewDTO.review.<field>` and version data via `reviewDTO.latestVersion`. |
| `front/src/models/Review.ts` | Pure entity model — `uuid`, `title`, `description`, `notes`, `mediaType`, `createdAt`, `updatedAt`, `script` (a `Script` instance, reuses `front/src/models/Script.ts`) + `fromJSON` / `toJSON`. `updatedAt` is nullable since the trimmed list payload omits it. No `latestVersion` / no `currentStatus` — those live on the DTO. |
| `front/src/models/ReviewVersion.ts` | Class + serializers. Carries `uuid`, `fileCount`, `status: ReviewStatus`, `createdAt`. No `comments` field — comments are fetched separately via the comments-list endpoint. |
| `front/src/models/ReviewComment.ts` | Single comment row: `uuid`, `body`, `status`, `videoTimecodeSeconds`, `createdAt`, an optional `author: User` (reuses the existing [`User` model](../src/models/User.ts)), the parent comment's UUID (`parentCommentUuid`, only present on replies), and the recursive `replies: ReviewComment[]` list (nested by the backend `api_review_comments_list` group). Convenience getters: `isTopLevel` and `isResolved`. Backend serializes the author with `uuid`, `firstName`, `lastName`, `email`. |
| `front/src/models/enums/ReviewCommentStatus.ts` | `Open`, `Resolved`. Mirrors the backend `ReviewCommentStatus` enum (snake_case string values). Used for the resolve / reopen toggle. |
| `front/src/models/enums/ReviewStatus.ts` | `Pending`, `ChangesRequested`, `Approved`, `Rejected` + translation keys, plus `reviewStatusToBgClass` / `reviewStatusToTextClass` / `reviewStatusToBorderClass` / `reviewStatusToIcon` / `reviewStatusToBannerTitleKey` / `reviewStatusToBannerSubtitleKey`. Call sites feed these maps into the generic `Tag` and `Banner` UI components. Mirrors the convention used in `ScriptGenerationStatus.ts`. |
| `front/src/models/enums/FileInvalidReason.ts` | Mirror of the shared backend enum (`missing_file`, `too_many_files`, `too_few_files`, `file_too_large`, `invalid_mime_type`, `invalid_payload`) + translation keys. Consumed by the 33001 and 27004 resolvers in `errorCodeMessages.ts` (via the local `resolveFileInvalidReason` helper) to surface the specific reason via `meta.reason`. |
| `front/src/models/enums/MediaType.ts` | Reused as-is (matches backend `Post.mediaType`). |

The list and show endpoints both return `ReviewWithLatestVersionDTO` instances — the list omits `comments` (and most version fields), the show returns the full version data. Comments live in their own query cache via `useListPaginatedReviewComments`.

## React Query hooks (`front/src/hooks/api/reviews/`)

| Hook | Endpoint | Notes |
|---|---|---|
| `useListPaginatedReviews({ projectUuid, limit, status?, searchTerm? })` | `GET /reviews` | `useInfiniteQuery` over pages of `limit` (default 20). Optional `status` and `searchTerm` are forwarded to the API only when truthy; the query key tracks them so React Query refetches when filters change. Disabled when `projectUuid` is null. Trimmed list payload. |
| `useShowReview({ uuid })` | `GET /reviews/{uuid}` | One-shot fetch — returns a `ReviewWithLatestVersionDTO` (no comments). |
| `useCreateReview()` | `POST /reviews` | Builds `FormData` with one `files[]` entry per file. Invalidates the list. |
| `useUpdateReview()` | `PATCH /reviews/{uuid}` | Invalidates list + detail. |
| `useDeleteReview()` | `DELETE /reviews/{uuid}` | Invalidates list, removes detail. |
| `useApproveReviewVersion()` | `POST /review-versions/{reviewVersionUuid}/approve` | Client-only. Takes `{ reviewVersionUuid, reviewUuid, projectUuid }`. Response is the updated `ReviewWithLatestVersionDTO` (show shape) — written directly into the detail cache via `setQueryData` to avoid a refetch flicker; the list is invalidated. |
| `useRequestChangesOnReviewVersion()` | `POST /review-versions/{reviewVersionUuid}/request-changes` | Client-only. Same input plus `comment: string`. Same response shape. Also invalidates `reviewsQueryKeys.comments(reviewVersionUuid)` so the newly-created comment shows up in the timeline. |
| `useListPaginatedReviewComments({ reviewVersionUuid, limit })` | `GET /review-comments?reviewVersionUuid=&page=&limit=` | `useInfiniteQuery` (default `limit=20`) over the comments of a single media version. Pages are flat arrays of `ReviewComment` (replies still nested recursively). Newest-first ordering. Disabled when `reviewVersionUuid` is null. Powers `ReviewCommentsTimeline`. |
| `useCreateReviewComment()` | `POST /review-comments` | **Used by both surfaces** (agency replies + client follow-up comments). Input: `{ reviewVersionUuid, reviewUuid, projectUuid, body, parentCommentUuid?, videoTimecodeSeconds? }`. Setting `parentCommentUuid` makes the new comment a reply (fully threaded). `videoTimecodeSeconds` pins it to a video moment (top-level + video-only — backend rejects the pair). Does not change media-version status. Response is the show shape (no comment in the body); the hook invalidates `reviewsQueryKeys.comments(reviewVersionUuid)` so the timeline refetches. |
| `useUpdateReviewComment()` | `PATCH /review-comments/{uuid}` | Partial update with presentFields semantics: only forwards keys that are explicitly passed (so `videoTimecodeSeconds: null` correctly clears the pin, while `videoTimecodeSeconds: undefined` leaves it alone). Inputs: `{ commentUuid, reviewVersionUuid, reviewUuid, projectUuid, body?, status?, videoTimecodeSeconds? }`. Backend enforces: `body` + `videoTimecodeSeconds` mutations are author-only; `status` mutations are agency-only and top-level-only. Updates the detail cache, invalidates the list and the comments query for the affected version. Used by the resolve / reopen toggle on `ReviewCommentItem`. |

Query keys live in `reviewsQueryKeys.ts`.

## State

Two stores under `front/src/stores/reviews/`:

`reviewsStore.ts` — Zustand (resettable, not persisted):

```ts
{ selectedReviewUuid: string | null, isCreatePanelOpen: boolean }
+ selectDraft / openCreatePanel / closeCreatePanel / closeAll
```

`selectReview(uuid)` closes the create modal so the modal never sits over a newly-clicked detail. `openCreatePanel()` no longer clears `selectedReviewUuid` — the previously-selected draft stays visible behind the modal backdrop, and dismissing the modal returns the user to where they were.

`reviewFilterStore.ts` — Zustand (resettable, persisted with `persist` middleware under key `app:reviews:filter`, partialized to **`selectedStatus` only** — search term is intentionally session-scoped):

```ts
{ selectedStatus: ReviewStatus | null, searchTerm: string }
+ setSelectedStatus / setSearchTerm
```

`selectedStatus === null` means "All" — the chip filter omits the `status` query param so the API returns every status. Mirrors `useScriptFilterStore`.

## Components

The Review UI follows a **role-owned-Page** layering pattern. Each role has its own top-level Page that orchestrates the composition (`AgencyReviewsPage` under `front/src/components/agency/reviews/`, `ClientReviewsPage` under `front/src/components/client/reviews/`); both compose the shared `ReviewsLayout` + `ReviewsList` and feed in their role-specific detail panel (`AgencyReviewDetailPanel` / `ClientReviewDetailPanel`), which in turn wraps the shared `ReviewDetailPanel` with role-specific slot props. The shared layer in `front/src/components/reviews/` never imports from `~/components/agency/*` or `~/components/client/*` — that's the structural invariant.

### Shared (`front/src/components/reviews/`)

| Component | Role |
|---|---|
| `ReviewsLayout` | Two-region shell: left list (`w-75 border-r border-pale-gray`) + `<main>` that renders either the caller-supplied `detail` slot or the centered "select a review" empty state. |
| `ReviewsList` | Fixed toolbar (SearchBar with Cmd/Ctrl+F focus shortcut + row of status filter chips: `All / Awaiting / Changes / Approved / Rejected`) + scrollable list with infinite scroll. Empty state differentiates "no drafts yet" (with "New draft" CTA when `onCreateReview` is provided) from "no matches" (when a search/status filter is active). Filtering is server-side via `useListPaginatedReviews`. |
| `ReviewTile` | Single row: thumbnail (first stored file) with always-on type-icon overlay (bottom-right) + carousel `1/N` slide-count badge (top-right). Title, mediaType · relative-updated-time meta row, status `Tag` (generic UI component fed with `reviewStatusTo*` maps). Active state uses the neutral `bg-clear-2 border-pale-gray shadow-sm`. Identical between roles. |
| `ReviewDetailPanel` | Edit-aware orchestrator. Renders the status `Banner` → `ReviewDetailHeader` → `ReviewMediaViewer` → `ReviewDetailBody` + `ReviewDetailSideCard` row → optional `footer` slot → `ReviewCommentsTimeline` → optional `children` slot (modals). Wraps its contents in a `<form>` and wires `onSubmit` to `form.submit()` when the optional `form` prop is provided; otherwise renders a plain `<div>`. Optional slots: `form` (drives edit affordances), `onOpenLinkedScript` (eyebrow + side-card "From script" links), `headerActions` (header right-side buttons, e.g. agency Delete), `footer` (between the body row and the comments timeline — used by the client `ActionsBar`), `children` (sibling modals). |
| `ReviewDetailHeader` | Eyebrow row (`{type icon} {type label} · {relative date} · From script · {title}`) + title (`Input simple` when `form?.canEdit`, `<h1>` otherwise) + right-side action cluster. The Save button renders when `form?.hasChanges`; the `actions` slot carries everything else (e.g. agency Delete). The "From script" link only renders when `onOpenLinkedScript` is supplied and `form?.canEdit` is false. |
| `ReviewDetailBody` | Left column of the metadata grid: description + dashed-callout client-notes + optional linked-script section. Description / notes flip between `TextArea simple` and plain text based on `form?.canEdit`. The linked-script section renders only when the caller passes the `linkedScriptField?: ReactNode` slot (agency-only — the shared body never imports `LinkedScriptField` itself). |
| `ReviewDetailSideCard` | Right column: type / status / (linked script, when an `onLinkedScriptClick` handler is supplied) / uploaded / updated rows. Status renders the generic `Tag` driven by `reviewStatusTo*` maps. The `SideCardRow` helper is local to this file. |
| `ReviewCommentsTimeline` | Comments thread for the **latest** media version only. Drives `useListPaginatedReviewComments(latestVersion.uuid)`: infinite-scroll list of top-level comments (newest first), each rendering its nested `replies` recursively via `ReviewCommentItem`. Renders a "Load more" button while `hasMore`. Always mounts a `CreateReviewCommentForm` below the list so both agency and client can post. Reads the current user via `useCurrentUser` to derive `isAgencyViewer`. Accepts an optional `videoElementRef` — when set and the latest version is a video, the form renders the "Pin at current time" capture and the items render clickable timecode chips. |
| `ReviewCommentItem` | Single comment card: `ReviewCommentAuthorBadge` · optional clickable video-timecode chip · optional "Resolved" badge · short date + body (`whitespace-pre-wrap`). Footer holds the **Reply** toggle (when `canReply`, i.e. on the latest version) and, for agency viewers on top-level comments, the **Mark as resolved / Reopen** toggle (wired to `useUpdateReviewComment`). Renders its `replies` recursively with a left border + `pl-3` indent; visual indentation is capped at 3 levels. Resolved comments get an `opacity-70` muted treatment. |
| `CreateReviewCommentForm` | `TextArea` (3 rows, max 5000 chars, trimmed) + Send button. Calls `useCreateReviewComment` with the latest version's UUID. Empty-on-submit / too-long inline error; success/error toasts. Optional props: `parentCommentUuid` (reply form), `showTimecodeInput` + `videoElementRef` (renders the "Pin at current time" toggle for video drafts), `onCancel`, `onSubmitted`. |
| `ReviewMediaViewer` | Tiny dispatcher. Switches on `mediaType` and delegates to `ReviewVideoViewer` / `ReviewImageViewer` / `ReviewCarouselViewer`. Optional `videoElementRef` is forwarded only to the video viewer. |
| `ReviewVideoViewer` | `rounded-2xl bg-dark` framed video. Native `<video controls preload="metadata">` capped at `max-h-[70vh]`, plus a `bg-clear-3` footer showing the media-type label and the duration (read client-side via `loadedmetadata`, formatted `m:ss`). Owns its own data fetching via `useShowReviewVersionFile(reviewVersionUuid, 1)`. |
| `ReviewImageViewer` | `rounded-2xl bg-dark` framed single image with `object-contain` (preserves native aspect, capped at `max-h-[70vh]`). |
| `ReviewCarouselViewer` | Stateful active-slide viewer inside the `rounded-2xl bg-dark` frame: left/right arrow buttons (disabled at the ends), top-right slide counter, dot indicators, and a `bg-clear-3` thumbnail strip (active thumb has a `border-dark` ring). Renders one private `CarouselSlideImage` per slide for both the active frame and each thumb — React Query dedupes via the `versionFile` query key. |

### Agency-only (`front/src/components/agency/reviews/`)

| Component | Role |
|---|---|
| `AgencyReviewsPage` | Top-level orchestrator for the agency surface. Reads `selectedReviewUuid` + the create-panel toggle from `useReviewsStore`, renders the shared `ReviewsLayout` with `onCreateReview={openCreatePanel}` and `detail={<AgencyReviewDetailPanel … />}` when a review is selected, and mounts `CreateReviewModal` alongside. |
| `AgencyReviewDetailPanel` | Loads the review via `useShowReview`, wires `useReviewEditForm`, `useDeleteReview`, and the focus-script store, then renders the shared `ReviewDetailPanel` with `form`, `onOpenLinkedScript` (navigates to `agencyScriptsPath`), `headerActions={<Delete />}`, `linkedScriptField={<LinkedScriptField … />}` while editing, and a `ConfirmDeleteDialog` as `children`. |
| `CreateReviewModal` | `ModalOverlay` (`w-160`, `max-h-[calc(100vh-80px)]`) hosting the create form in three regions: a **header** (modal title + subtitle), a **scrollable body** (content-type cards → file dropzone → title → description + hint → notes + hint → linked-script field), and a **sticky footer** on `bg-clear-2` holding Cancel + Submit. Driven by `showModal` / `onClose` props. The linked-script field is the shared [`LinkedScriptField`](../src/components/agency/scripts/LinkedScriptField.tsx); when its picker is open the create modal slides to `align="left-of-center"`. Frontend validates file count + size + MIME before posting. Catches HTTP 409 → script-already-has-review. On success calls `selectReview(uuid)` which auto-closes the panel. |
| `ReviewFileDropzone` | Drag-drop area + per-file row with reorder (↑/↓) for carousel. Single-file for video/image. Renders the dropzone surface via `FileUpload`'s `children` render-prop. |

### Client-only (`front/src/components/client/reviews/`)

| Component | Role |
|---|---|
| `ClientReviewsPage` | Top-level orchestrator for the client surface. Reads `selectedReviewUuid` from `useReviewsStore` and renders the shared `ReviewsLayout` with `detail={<ClientReviewDetailPanel … />}`. No create modal, no `onCreateReview`. |
| `ClientReviewDetailPanel` | Loads the review via `useShowReview`, wires `useApproveReviewVersion` + the toast store, then renders the shared `ReviewDetailPanel` with `footer={<ClientReviewActionsBar />}` and a `ClientReviewRequestChangesModal` as `children`. No `form` or `linkedScriptField` props → the shared panel renders in read-only mode. |
| `ClientReviewActionsBar` | Status-driven button row inserted into the panel's `footer` slot (`Pending` → Approve + Request changes; `Approved` → Request changes only; `ChangesRequested` → read-only "Waiting for the agency to upload a new version" message; `Rejected` → renders nothing). |
| `ClientReviewRequestChangesModal` | `ModalOverlay` with required `TextArea` + Cancel / Submit footer. Calls `useRequestChangesOnReviewVersion`. |

### Shared blob-fetching hooks

| Hook | Role |
|---|---|
| `useShowReviewVersionFile(reviewVersionUuid, index)` | React Query hook that fetches a stored upload as a blob via `httpClient` (`GET /review-versions/files?reviewVersionUuid=&index=`) and exposes a `fileUrl` (an `URL.createObjectURL` blob URL, revoked on unmount). Backing query key: `reviewsQueryKeys.versionFile(reviewVersionUuid, index)`. |
| `useShowReviewVersionStream(reviewVersionUuid, path)` | Sibling hook that fetches a single HLS artifact as a blob (`GET /review-versions/stream?reviewVersionUuid=&path=`). Backing query key: `reviewsQueryKeys.versionStream(reviewVersionUuid, path)`. |

## i18n

Namespace: `reviews` (`front/src/services/i18n/locales/reviews/{en,fr}.json`). Auto-registered by `services/i18n/i18n.ts` (glob-driven). Covers page chrome, status labels, form labels, validation messages, delete confirm.

The create modal pulls its chrome and content-type hints from the `form` namespace: `form.modalTitle`, `form.modalSubtitle`, `form.mediaType{Video,Image,Carousel}Hint`, `form.descriptionHint`, and `form.notesHint`.

The `navigation` namespace also has a `items.drafts` key in both languages.

## Upload constraints (mirror of the backend)

| Media type | Files | MIME | Max size |
|---|---|---|---|
| Video | 1 | `video/mp4`, `video/quicktime`, `video/webm` | 500 MB |
| Image | 1 | `image/png`, `image/jpeg`, `image/webp` | 20 MB |
| Carousel | 2–10 | `image/png`, `image/jpeg`, `image/webp` | 20 MB each |

Pre-flight validation runs in `CreateReviewModal` before submit; backend re-validates and is authoritative.

## Stream endpoint behavior

Two flat top-level routes on the backend, both driven by query-param DTOs — see `back/docs/review-feature.md` for the full contract:

- `GET /api/review-versions/files?reviewVersionUuid=&index=N` — returns the stored upload at `{index}.{ext}` (extension globbed). Used by `useShowReviewVersionFile` (axios `params: { reviewVersionUuid, index }`) for image / carousel / pre-transcode video. Range requests work — useful for scrubbing in the `<video>` player.
- `GET /api/review-versions/stream?reviewVersionUuid=&path=…` — HLS artifacts under the media version's `stream/` directory. `path` is `master.m3u8`, `1080p/index.m3u8`, `720p/segment_001.ts`, etc. Only `.m3u8` and `.ts` accepted. Used by `useShowReviewVersionStream` (same shape as the file hook, blob-returning) once `videoStreamingStatus === ready`. Full HLS player wiring (hls.js for Chromium/Firefox, native for Safari) is a follow-up task — the current video viewer still hits the file hook with `index=1`, which 404s after transcoding succeeds.

Both routes return `404` when the file is missing (maps to `MissingReviewException`).

## Phase 2 — client review surface

A read-only / action surface at `/client/reviews` for `ROLE_CLIENT` users. The agency-side surface is unchanged, but reads status through the new model getter `review.currentStatus` (= `latestVersion.status`).

### Route + navigation

- Path: `clientReviewsPath = '/client/reviews'` (`front/src/routes/routePaths.ts`).
- Route file: `front/src/routes/client/reviews.tsx` (mirrors the agency entry — `useSelectFocusedProject` + `ClientReviewsPage`).
- Registered in `front/src/router.tsx` next to `ClientHomePage` and `ClientContentsPage`.
- Sidebar nav entry added directly in `ClientDesktopSidebar.tsx` (the client sidebar does not consume `NavigationItem`) between Home and Contents. Icon: `DocumentDuplicateIcon` (outline / solid variants), label from `navigation:items.reviews`.

### State

The client view reuses the existing shared Zustand stores under `front/src/stores/reviews/`:

- `reviewsStore.ts` — `selectedReviewUuid` is the only field the client surface reads. `isCreatePanelOpen` exists for the agency view and is ignored by client code.
- `reviewFilterStore.ts` — `selectedStatus` + `searchTerm`. Persistence key (`app:reviews:filter`) is shared; since a user is either agency or client (never both), there's no cross-role state contamination.

The request-changes modal's open state is local to `ClientReviewDetailPanel` via `useState` — no need to leak that purely-client UI state into the shared store.

### Components

See the unified [Components](#components) section above. The `/client/reviews` route mounts `ClientReviewsPage` (the client-owned top-level Page), which composes the shared `ReviewsLayout` with `<ClientReviewDetailPanel />` in its `detail` slot. The detail panel loads the review, wires `useApproveReviewVersion`, and feeds `ClientReviewActionsBar` + `ClientReviewRequestChangesModal` into the shared `ReviewDetailPanel` via its `footer` / `children` slots. Since no `form` or `linkedScriptField` slot is provided, the shared `ReviewDetailHeader` / `ReviewDetailBody` render in read-only mode automatically.

### i18n

- `reviews` namespace gains a `comments.*` block (timeline title, version label, uploaded-on, pluralized comment count, no-comments fallback, unknown-author fallback, composer placeholder / submit / cancel / inline errors / toasts, plus the reply / resolve / reopen labels, the "Resolved" / "Open" status badges, the "Pin at current time" / "Pinned at {{time}}" / "Clear pin" composer chips, and `comments.update.toast.*` success / error copy for the PATCH endpoint). Used by both surfaces via the shared timeline + composer + item.
- `clientReviews` namespace covers what's truly client-only: page chrome (no-selection empty state), action labels + waiting message, request-changes modal copy, approve/request-changes toasts.

Error code map (`front/src/services/apiErrorHandler/errorCodeMessages.ts`): direct one-to-one mappings for every Review comment exception — `33008` → `errors:review.notPending`, `33009` → `errors:review.notPendingOrApproved`, `33010` → `errors:review.notLatestVersion`, `33011` → `errors:review.commentEmpty`, `33012` → `errors:review.commentTooLong`, `33013` → `errors:review.commentPayloadInvalid`, `33014` → `errors:review.commentParentNotFound`, `33015` → `errors:review.commentReplyCannotHaveTimecode`, `33016` → `errors:review.commentNotFound`, `33017` → `errors:review.commentStatusInvalid`, `33018` → `errors:review.commentStatusOnReplyForbidden`, `33019` → `errors:review.commentEditForbidden`, `33020` → `errors:review.commentTimecodeOnReplyForbidden`. No resolver functions — each error has a single user-facing message (matches the project convention: one exception per error condition).

## Out of scope (Phase 2)

- Agency-side feedback inbox / unread badge / per-version thread surfacing — Phase 3.
- Re-uploading a new media version on the same draft — Phase 3.
- Backlink to a published Post — Phase 4.
- Subscription-tier gating on version history — Phase 5.
