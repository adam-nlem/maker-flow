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

## Models + enums

| File | Purpose |
|---|---|
| `front/src/models/Review.ts` | Class + `fromJSON` / `toJSON`. Carries `latestVersion: ReviewVersion \| null` directly (no `versions` collection — older versions are not exposed by the API). `currentStatus` derives from `latestVersion?.status`. The `script` field is a `Script` instance (reuses `front/src/models/Script.ts` — no separate summary type). `updatedAt` is nullable since the trimmed list payload omits it. |
| `front/src/models/ReviewVersion.ts` | Class + serializers. Carries `uuid`, `fileCount`, `status: ReviewStatus`, `createdAt`. No `comments` field — comments are fetched separately via the comments-list endpoint. |
| `front/src/models/ReviewComment.ts` | Single comment row: `uuid`, `body`, `status`, `videoTimecodeSeconds`, `createdAt`, an optional `author: User` (reuses the existing [`User` model](../src/models/User.ts)), the parent comment's UUID (`parentCommentUuid`, only present on replies), and the recursive `replies: ReviewComment[]` list (nested by the backend `api_review_comments_list` group). Convenience getters: `isTopLevel` and `isResolved`. Backend serializes the author with `uuid`, `firstName`, `lastName`, `email`. |
| `front/src/models/enums/ReviewCommentStatus.ts` | `Open`, `Resolved`. Mirrors the backend `ReviewCommentStatus` enum (snake_case string values). Used for the resolve / reopen toggle. |
| `front/src/models/enums/ReviewStatus.ts` | `Pending`, `ChangesRequested`, `Approved`, `Rejected` + translation keys, plus `reviewStatusToBgClass` / `reviewStatusToTextClass` / `reviewStatusToBorderClass` / `reviewStatusToIcon` / `reviewStatusToBannerTitleKey` / `reviewStatusToBannerSubtitleKey`. Call sites feed these maps into the generic `Tag` and `Banner` UI components. Mirrors the convention used in `ScriptGenerationStatus.ts`. |
| `front/src/models/enums/FileInvalidReason.ts` | Mirror of the shared backend enum (`missing_file`, `too_many_files`, `too_few_files`, `file_too_large`, `invalid_mime_type`, `invalid_payload`) + translation keys. Consumed by the 33001 and 27004 resolvers in `errorCodeMessages.ts` (via the local `resolveFileInvalidReason` helper) to surface the specific reason via `meta.reason`. |
| `front/src/models/enums/MediaType.ts` | Reused as-is (matches backend `Post.mediaType`). |

The list and show endpoints both return a `latestVersion` object directly on each `Review` — the list omits `comments` (and most version fields), the show returns the full version data. Comments live in their own query cache via `useListPaginatedReviewComments`.

## React Query hooks (`front/src/hooks/api/reviews/`)

| Hook | Endpoint | Notes |
|---|---|---|
| `useListPaginatedReviews({ projectUuid, limit, status?, searchTerm? })` | `GET /reviews` | `useInfiniteQuery` over pages of `limit` (default 20). Optional `status` and `searchTerm` are forwarded to the API only when truthy; the query key tracks them so React Query refetches when filters change. Disabled when `projectUuid` is null. Trimmed list payload. |
| `useShowReview({ uuid })` | `GET /reviews/{uuid}` | One-shot fetch — Review + `latestVersion` (no comments). |
| `useCreateReview()` | `POST /reviews` | Builds `FormData` with one `files[]` entry per file. Invalidates the list. |
| `useUpdateReview()` | `PATCH /reviews/{uuid}` | Invalidates list + detail. |
| `useDeleteReview()` | `DELETE /reviews/{uuid}` | Invalidates list, removes detail. |
| `useApproveReviewVersion()` | `POST /review-versions/{reviewVersionUuid}/approve` | Client-only. Takes `{ reviewVersionUuid, reviewUuid, projectUuid }`. Response is the updated `Review` (show shape) — written directly into the detail cache via `setQueryData` to avoid a refetch flicker; the list is invalidated. |
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

## Components (`front/src/components/agency/reviews/`)

| Component | Role |
|---|---|
| `ReviewsPageView` | Orchestrator. Two-region layout: persistent left list (`w-75` ≈ 300 px, `border-r border-pale-gray`) + scrollable `<main>` that renders `ReviewDetailPanel` when a draft is selected, otherwise a centered empty state (`emptyState.noSelection.*`). The create flow is rendered above the layout via `CreateReviewModal`. |
| `ReviewsList` | Fixed toolbar (SearchBar with Cmd/Ctrl+F focus shortcut + row of status filter chips: `All / Awaiting / Changes / Approved / Rejected`) + scrollable list with infinite scroll. Empty state differentiates "no drafts yet" (with "New draft" CTA) from "no matches" (when a search/status filter is active). Filtering is server-side via the extended `useListPaginatedReviews`. |
| `ReviewListItem` | Single row: thumbnail (first stored file) with always-on type-icon overlay (bottom-right) + carousel `1/N` slide-count badge (top-right). Title, mediaType · relative-updated-time meta row, status `Tag` (generic UI component fed with `reviewStatusTo*` maps). Active state uses the neutral `bg-clear-2 border-pale-gray shadow-sm` (no mint tint). |
| `ReviewDetailPanel` | Thin composition. Loading guard → `LoadedReviewDetailPanel` once `review` is non-null. Wires `useReviewEditForm` (form state), `useDeleteReview`, and the delete-confirm dialog; then renders the generic `Banner` (driven by `reviewStatusToBanner*` / `reviewStatusTo*` enum maps) followed by `ReviewDetailHeader` / `ReviewMediaViewer` / `ReviewDetailBody` / `ReviewDetailSideCard` inside a single `<form>` whose `onSubmit` calls `form.submit()` (no-op when `!hasChanges`). |
| `ReviewDetailHeader` | Eyebrow row (`{type icon} {type label} · v{n} · {relative date} · From script · {title}`) + title (`Input simple` when editable, `<h1>` otherwise) + action cluster (animated Save + Delete). The Save button is gated by `useDelayedUnmount(form.hasChanges, 200)` so it can play `animate-fade-out` (defined in `app.css`) before unmounting. The "From script" link is hidden in edit mode since the `LinkedScriptField` in the body is the source of truth then. |
| `ReviewDetailBody` | Left column of the metadata grid: description + dashed-callout client-notes + linked-script field. Each section flips between `TextArea simple` and plain text based on `form.canEdit`. The linked-script field only renders while editable and is the shared [`LinkedScriptField`](../src/components/agency/scripts/LinkedScriptField.tsx) — a tile with `Change` / `×` actions that opens [`ScriptPickerModal`](../src/components/agency/scripts/ScriptPickerModal.tsx) (search + status chips + paginated list). See [script-picker-feature.md](script-picker-feature.md). |
| `ReviewDetailSideCard` | Right column: type / status / (linked script, when an `onLinkedScriptClick` handler is supplied) / uploaded / updated rows. Status renders the generic `Tag` driven by `reviewStatusTo*` maps. The parent hides the linked-script row in edit mode by passing `undefined`. The `SideCardRow` helper is local to this file. |
| `CreateReviewModal` | `ModalOverlay` (`w-160`, `max-h-[calc(100vh-80px)]`) hosting the create form in three regions: a **header** (modal title + subtitle, bottom-bordered), a **scrollable body** (content-type cards → file dropzone → title → description + hint → notes + hint → linked-script field), and a **sticky footer** on `bg-clear-2` holding Cancel + Submit. Content-type cards are two-line: icon + label on top, per-type constraint hint below (`form.mediaType{Video,Image,Carousel}Hint`); the selected card flips to `bg-clear border-dark shadow-sm`. Driven by `showModal` / `onClose` props. The linked-script field is the shared [`LinkedScriptField`](../src/components/agency/scripts/LinkedScriptField.tsx); when its picker is open the create modal slides to `align="left-of-center"` and the picker opens to `right-of-center` so both are visible side-by-side — see [script-picker-feature.md](script-picker-feature.md). Frontend validates file count + size + MIME before posting. Catches HTTP 409 → script-already-has-review. On success calls `selectReview(uuid)` which auto-closes the panel. |
| `ReviewFileDropzone` | Drag-drop area + per-file row with reorder (↑/↓) for carousel. Single-file for video/image. Renders the dropzone surface via `FileUpload`'s `children` render-prop (large `border-2 border-dashed` panel on `bg-clear-2`, flipping to `border-primary bg-primary/5 text-primary` on hover/drag) so the local restyle stays self-contained and doesn't affect other consumers of `FileUpload`. |
| `ReviewMediaViewer` *(shared — `~/components/reviews/`)* | Tiny dispatcher consumed by both the agency `ReviewDetailPanel` and (future) the client view. Switches on `mediaType` and delegates to `ReviewVideoViewer` / `ReviewImageViewer` / `ReviewCarouselViewer`. |
| `ReviewVideoViewer` *(shared)* | `rounded-2xl bg-dark` framed video. Native `<video controls preload="metadata">` capped at `max-h-[70vh]`, plus a `bg-clear-3` footer showing the media-type label and the duration (read client-side via `loadedmetadata`, formatted `m:ss`). Owns its own data fetching via `useShowReviewVersionFile(reviewVersionUuid, 1)` — renders a small spinner inside the dark frame while the blob downloads. |
| `ReviewImageViewer` *(shared)* | `rounded-2xl bg-dark` framed single image with `object-contain` (preserves native aspect, capped at `max-h-[70vh]`). Owns its own data fetching via `useShowReviewVersionFile(reviewVersionUuid, 1)`. |
| `ReviewCarouselViewer` *(shared)* | Stateful active-slide viewer inside the `rounded-2xl bg-dark` frame: left/right arrow buttons (disabled at the ends), top-right slide counter, dot indicators, and a `bg-clear-3` thumbnail strip (thumbs use `object-cover`, active thumb has a `border-dark` ring). Renders one private `CarouselSlideImage` per slide for both the active frame and each thumb — React Query dedupes via the `versionFile` query key so each file is fetched once. |
| `useShowReviewVersionFile(reviewVersionUuid, index)` | React Query hook that fetches a stored upload as a blob via `httpClient` (`GET /review-versions/files?reviewVersionUuid=&index=`) and exposes a `fileUrl` (an `URL.createObjectURL` blob URL, revoked on unmount). Same pattern as `useShowPostThumbnail` / `useShowAgencyLogo`. Backing query key: `reviewsQueryKeys.versionFile(reviewVersionUuid, index)`. |
| `useShowReviewVersionStream(reviewVersionUuid, path)` | Sibling hook that fetches a single HLS artifact as a blob (`GET /review-versions/stream?reviewVersionUuid=&path=`). Same blob-URL contract. Backing query key: `reviewsQueryKeys.versionStream(reviewVersionUuid, path)`. |

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
- Route file: `front/src/routes/client/reviews.tsx` (mirrors the agency entry — `useSelectFocusedProject` + `ClientReviewsPageView`).
- Registered in `front/src/router.tsx` next to `ClientHomePage` and `ClientContentsPage`.
- Sidebar nav entry added directly in `ClientDesktopSidebar.tsx` (the client sidebar does not consume `NavigationItem`) between Home and Contents. Icon: `DocumentDuplicateIcon` (outline / solid variants), label from `navigation:items.reviews`.

### State

The client view reuses the existing shared Zustand stores under `front/src/stores/reviews/`:

- `reviewsStore.ts` — `selectedReviewUuid` is the only field the client surface reads. `isCreatePanelOpen` exists for the agency view and is ignored by client code.
- `reviewFilterStore.ts` — `selectedStatus` + `searchTerm`. Persistence key (`app:reviews:filter`) is shared; since a user is either agency or client (never both), there's no cross-role state contamination.

The request-changes modal's open state is local to `ClientReviewDetailPanel` via `useState` — no need to leak that purely-client UI state into the shared store.

### Shared components (`front/src/components/reviews/`)

The list + layout + comments primitives are role-agnostic and live in the shared folder. Agency and client surfaces compose them via thin wrappers.

| Component | Role |
|---|---|
| `ReviewsLayout` | Two-region shell: left list (`w-75 border-r border-pale-gray`) + `<main>` that renders either the caller-supplied `detail` slot or the centered "select a review" empty state. Takes an optional `onCreateReview` callback (agency only) that wires the CTA in the list's empty state. |
| `ReviewsList` | Toolbar (`SearchBar` with `Cmd/Ctrl+F` shortcut + row of status `FilterChip`s) + infinite-scroll list driven by `useListPaginatedReviews`. Reads selection + filters from the shared `useReviewsStore` / `useReviewFilterStore`. When `onCreateReview` is provided, the empty state renders a primary CTA. |
| `ReviewListItem` | Visual row — thumbnail with type-icon overlay + carousel slide-count badge, title, type + relative-updated meta, status `Tag` driven by `review.currentStatus`. Identical between roles — agency-side edit / delete affordances live in the detail panel, never here. |
| `ReviewMediaViewer` + `ReviewVideoViewer` / `ReviewImageViewer` / `ReviewCarouselViewer` | Already shared in Phase 1. `ReviewMediaViewer` + `ReviewVideoViewer` now accept an optional `videoElementRef: RefObject<HTMLVideoElement \| null>` — the detail panels create the ref via `useRef`, pass it here, and also forward it to `ReviewCommentsTimeline` so the timeline can seek the video on timecode-chip clicks and capture `currentTime` for the "Pin at current time" composer toggle. Image / carousel viewers ignore the ref. |
| `ReviewCommentsTimeline` | Comments thread for the **latest** media version only — older versions are no longer exposed by the API. Drives `useListPaginatedReviewComments(latestVersion.uuid)`: infinite-scroll list of top-level comments (newest first), each rendering its nested `replies` recursively via `ReviewCommentItem`. Renders a "Load more" button while `hasMore`. Always mounts a `ReviewCommentComposer` below the list so both agency and client can post. Reads the current user via `useCurrentUser` to derive `isAgencyViewer`. Accepts an optional `videoElementRef` — when set and the latest version is a video, the composer renders the "Pin at current time" capture and the items render clickable timecode chips. |
| `ReviewCommentItem` | Single comment card: `ReviewCommentAuthorBadge` · optional clickable video-timecode chip (only when `videoTimecodeSeconds !== null` and the parent passed `canSeek` + `videoElementRef`) · optional "Resolved" badge · short date + body (`whitespace-pre-wrap`). Footer holds the **Reply** toggle (when `canReply`, i.e. on the latest version) and, for agency viewers on top-level comments, the **Mark as resolved / Reopen** toggle (wired to `useUpdateReviewComment`). Renders its `replies` recursively with a left border + `pl-3` indent; visual indentation is capped at 3 levels even though the data depth is unlimited. Resolved comments get an `opacity-70` muted treatment. |
| `ReviewCommentComposer` | `TextArea` (3 rows, max 5000 chars, trimmed) + Send button. Calls `useCreateReviewComment` with the latest version's UUID. Empty-on-submit / too-long inline error; success/error toasts. Clears on success. Optional props: `parentCommentUuid` (turns the composer into a reply form — the inline reply UI on `ReviewCommentItem` uses this), `showTimecodeInput` + `videoElementRef` (renders the "Pin at current time" toggle; reads `videoElementRef.current.currentTime` on click and stores the float in local state — only active on the top-level composer of a video draft), `onCancel` (renders a Cancel button alongside Send — used by the reply form), `onSubmitted` (closes the inline reply form on success). Used by both surfaces. |

### Agency-only components (`front/src/components/agency/reviews/`)

| Component | Role |
|---|---|
| `ReviewsPageView` | Thin orchestrator: `<ReviewsLayout onCreateReview={openCreatePanel} detail={<ReviewDetailPanel />} … />` + `CreateReviewModal` mounted alongside. |
| `ReviewDetailPanel` | Edit-aware orchestrator: loading guard → status `Banner` → editable header (`ReviewDetailHeader`) → shared `ReviewMediaViewer` → editable body (`ReviewDetailBody`) + side card (`ReviewDetailSideCard`) → shared `ReviewCommentsTimeline` → `ConfirmDeleteDialog`. The form-state hook drives Save / Delete; the comments timeline lets the agency reply to client feedback inline. |
| `ReviewDetailHeader` | Eyebrow + editable title (`Input simple` when `form.canEdit`, `<h1>` otherwise) + animated Save / Delete cluster. |
| `ReviewDetailBody` | Description + dashed-callout notes + `LinkedScriptField` (latter only in edit mode); each section flips between `TextArea simple` and plain text based on `form.canEdit`. |
| `ReviewDetailSideCard` | Type / status / (linked script, when an `onLinkedScriptClick` handler is supplied) / uploaded / updated rows. |
| `CreateReviewModal` + `ReviewFileDropzone` | Agency-only create flow. |

### Client-only components (`front/src/components/client/reviews/`)

| Component | Role |
|---|---|
| `ClientReviewsPageView` | Thin wrapper: `<ReviewsLayout detail={<ClientReviewDetailPanel />} … />`. No create modal. |
| `ClientReviewDetailPanel` | Status `Banner` → `ClientReviewDetailHeader` → shared `ReviewMediaViewer` → `ClientReviewDetailBody` + `ClientReviewDetailSideCard` → `ClientReviewActionsBar` → shared `ReviewCommentsTimeline`. Hosts `ClientReviewRequestChangesModal`. Approve fires via `useApproveReviewVersion`. |
| `ClientReviewDetailHeader` | Read-only eyebrow + title (no edit input, no action cluster). |
| `ClientReviewDetailBody` | Read-only description + dashed-callout notes. |
| `ClientReviewDetailSideCard` | Read-only side card: type, status, uploaded / updated dates. |
| `ClientReviewActionsBar` | Status-driven button row (`Pending` → Approve + Request changes; `Approved` → Request changes only; `ChangesRequested` → read-only "Waiting for the agency to upload a new version" message; `Rejected` → renders nothing). |
| `ClientReviewRequestChangesModal` | `ModalOverlay` with required `TextArea` + Cancel / Submit footer. Calls `useRequestChangesOnReviewVersion`. |

### i18n

- `reviews` namespace gains a `comments.*` block (timeline title, version label, uploaded-on, pluralized comment count, no-comments fallback, unknown-author fallback, composer placeholder / submit / cancel / inline errors / toasts, plus the reply / resolve / reopen labels, the "Resolved" / "Open" status badges, the "Pin at current time" / "Pinned at {{time}}" / "Clear pin" composer chips, and `comments.update.toast.*` success / error copy for the PATCH endpoint). Used by both surfaces via the shared timeline + composer + item.
- `clientReviews` namespace covers what's truly client-only: page chrome (no-selection empty state), action labels + waiting message, request-changes modal copy, approve/request-changes toasts.

Error code map (`front/src/services/apiErrorHandler/errorCodeMessages.ts`): direct one-to-one mappings for every Review comment exception — `33008` → `errors:review.notPending`, `33009` → `errors:review.notPendingOrApproved`, `33010` → `errors:review.notLatestVersion`, `33011` → `errors:review.commentEmpty`, `33012` → `errors:review.commentTooLong`, `33013` → `errors:review.commentPayloadInvalid`, `33014` → `errors:review.commentParentNotFound`, `33015` → `errors:review.commentReplyCannotHaveTimecode`, `33016` → `errors:review.commentNotFound`, `33017` → `errors:review.commentStatusInvalid`, `33018` → `errors:review.commentStatusOnReplyForbidden`, `33019` → `errors:review.commentEditForbidden`, `33020` → `errors:review.commentTimecodeOnReplyForbidden`. No resolver functions — each error has a single user-facing message (matches the project convention: one exception per error condition).

## Out of scope (Phase 2)

- Agency-side feedback inbox / unread badge / per-version thread surfacing — Phase 3.
- Re-uploading a new media version on the same draft — Phase 3.
- Backlink to a published Post — Phase 4.
- Subscription-tier gating on version history — Phase 5.
