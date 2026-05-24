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
| `front/src/dtos/reviews/ReviewWithLatestVersionDTO.ts` | Response wrapper. `{ review: Review, latestVersion: ReviewVersion \| null, versions: ReviewVersion[], unresolvedCommentsCount: number }` + `fromJSON`. `currentStatus` getter derives from `latestVersion?.status`; `versionsNewestFirst` getter sorts a defensive copy by `createdAt DESC`. **`versions`** carries the full history (empty in the trimmed list payload — the constructor falls back to `[latestVersion]` so the version switcher renders consistently). **`unresolvedCommentsCount`** is the number of open top-level comments on the latest version (defaults to `0` when missing). Mirrors the `PostWithPlatformAndInsightsDTO` pattern. Consumers receive it as a prop named **`reviewDTO`**. |
| `front/src/models/Review.ts` | Pure entity model — `uuid`, `title`, `description`, `notes`, `mediaType`, `createdAt`, `updatedAt`, `script` (a `Script` instance, reuses `front/src/models/Script.ts`) + `fromJSON` / `toJSON`. `updatedAt` is nullable since the trimmed list payload omits it. No `latestVersion` / no `currentStatus` — those live on the DTO. |
| `front/src/models/ReviewVersion.ts` | Class + serializers. Carries `uuid`, `fileCount`, `status: ReviewStatus`, `videoStreamingStatus: VideoStreamingStatus \| null`, `createdAt`. No `comments` field — comments are fetched separately via the comments-list endpoint. |
| `front/src/models/enums/VideoStreamingStatus.ts` | `Pending`, `Processing`, `Ready`, `Failed` (snake_case string values mirroring the backend enum). Drives the `ReviewVideoViewer` lifecycle states (transcoding spinner / failed message / HLS playback). |
| `front/src/models/ReviewComment.ts` | Single comment row: `uuid`, `body`, `status`, `videoTimecodeSeconds`, `createdAt`, an optional `author: User` (reuses the existing [`User` model](../src/models/User.ts)), the parent comment's UUID (`parentCommentUuid`, only present on replies), and the recursive `replies: ReviewComment[]` list (nested by the backend `api_review_comments_list` group). Convenience getters: `isTopLevel` and `isResolved`. Backend serializes the author with `uuid`, `firstName`, `lastName`, `email`. |
| `front/src/models/enums/ReviewCommentStatus.ts` | `Open`, `Resolved`. Mirrors the backend `ReviewCommentStatus` enum (snake_case string values). Used for the resolve / reopen toggle. |
| `front/src/models/enums/ReviewStatus.ts` | `Pending`, `Approved`, `Rejected` + translation keys, plus `reviewStatusToBgClass` / `reviewStatusToTextClass` / `reviewStatusToBorderClass` / `reviewStatusToIcon` / `reviewStatusToBannerTitleKey` / `reviewStatusToBannerSubtitleKey`. Call sites feed these maps into the generic `Tag` and `Banner` UI components. Mirrors the convention used in `ScriptGenerationStatus.ts`. |
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
| `useListPaginatedReviewComments({ reviewVersionUuid, limit })` | `GET /review-comments?reviewVersionUuid=&page=&limit=` | `useInfiniteQuery` (default `limit=20`) over the comments of a single media version. Pages are flat arrays of `ReviewComment` (replies still nested recursively). Newest-first ordering. Disabled when `reviewVersionUuid` is null. Powers `ReviewCommentsTimeline`. |
| `useCreateReviewComment()` | `POST /review-comments` | **Used by both surfaces** (agency replies + client follow-up comments). Input: `{ reviewVersionUuid, reviewUuid, projectUuid, body, parentCommentUuid?, videoTimecodeSeconds? }`. Setting `parentCommentUuid` makes the new comment a reply (fully threaded). `videoTimecodeSeconds` pins it to a video moment (top-level + video-only — backend rejects the pair). Does not change media-version status. Response is the show shape (no comment in the body); the hook invalidates `reviewsQueryKeys.comments(reviewVersionUuid)` so the timeline refetches. |
| `useUpdateReviewComment()` | `PATCH /review-comments/{uuid}` | Partial update with presentFields semantics: only forwards keys that are explicitly passed (so `videoTimecodeSeconds: null` correctly clears the pin, while `videoTimecodeSeconds: undefined` leaves it alone). Inputs: `{ commentUuid, reviewVersionUuid, reviewUuid, projectUuid, body?, status?, videoTimecodeSeconds? }`. Backend enforces: `body` + `videoTimecodeSeconds` mutations are author-only; `status` mutations are agency-only and top-level-only. Updates the detail cache, invalidates the list and the comments query for the affected version. Used by the resolve / reopen toggle on `ReviewCommentItem`. |
| `useUploadReviewVersion()` | `POST /review-versions` | Agency-only (gated by the editor surface — not the hook). Inputs: `{ reviewUuid, projectUuid, mediaType, files }`. Multipart body carries `reviewUuid` + `files[]` (flat-URL convention shared with `POST /review-comments`). Pre-flight `validateReviewFiles` against the `Review.mediaType` before posting. On success: writes the returned `ReviewWithLatestVersionDTO` (show shape) directly into the detail cache so the version switcher and side-card refresh without a refetch flicker, then invalidates the list (the unresolved-count badge resets to `0` on the freshly created version). Does **not** invalidate the comments query — the new version has its own empty thread. |
| `useShowReviewVersionCover(reviewVersionUuid?)` | `GET /review-versions/{uuid}/cover` | Fetches the JPEG cover for a video version as a `Blob`, converts it to an object URL, and revokes it on unmount/refetch (`URL.createObjectURL` lifecycle managed in a `useEffect`). Mirrors `useShowAgencyLogo`. Treats `204` and empty blobs as "no cover" → returns `coverUrl: null`. `staleTime: Infinity` (the cover is immutable for a version's lifetime). Consumed by `ReviewVideoViewer` (passed to `ReviewVideoPlayer` as `posterUrl`) and by `ReviewTile`'s video thumbnail. |

Query keys live in `reviewsQueryKeys.ts`.

## State

Two stores under `front/src/stores/reviews/`:

`reviewsStore.ts` — Zustand (resettable, not persisted):

```ts
{ selectedReviewUuid: string | null, selectedVersionUuid: string | null, isCreatePanelOpen: boolean }
+ selectReview / selectVersion / openCreatePanel / closeCreatePanel / closeAll
```

`selectReview(uuid)` resets `selectedVersionUuid` to `null` and closes the create modal so the modal never sits over a newly-clicked detail, and the panel always opens on the latest version. `selectVersion(uuid)` is the version switcher's write target — `null` means "snap to latest" (used after `useUploadReviewVersion` resolves so the new version becomes the active one). `openCreatePanel()` does **not** clear `selectedReviewUuid` — the previously-selected draft stays visible behind the modal backdrop.

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
| `ReviewTile` | Single row: thumbnail with always-on type-icon overlay (bottom-right) + carousel `1/N` slide-count badge (top-right). For **video** drafts the thumbnail renders the extracted cover frame via `ReviewVideoThumbnail` (gated by `mediaType === Video && latestVersion` so the cover hook isn't called for image/carousel tiles); the icon overlay sits on top of it. Title, mediaType · relative-updated-time meta row, status `Tag` plus an **unresolved-comments `Tag`** (yellow palette, fed by `reviewDTO.unresolvedCommentsCount`) when the count is non-zero. Identical between roles. |
| `ReviewVideoThumbnail` | Tiny presentational component modeled on `ui/PostThumbnail`. Props: `{ reviewVersionUuid?, className? }`. Wraps `useShowReviewVersionCover(reviewVersionUuid)`, renders `<Shimmer />` while the cover is loading, the cover `<img>` once available, and nothing on 204. Background colour is owned by the parent container so the component sits cleanly on any surface. Used by `ReviewTile` today; reusable on any future surface that needs a video review's still frame. |
| `ReviewDetailPanel` | Edit-aware orchestrator. Reads `selectedVersionUuid` from `useReviewsStore` to derive the **active version** (falls back to `latestVersion`). Renders the status `Banner` → `ReviewDetailHeader` → `ReviewVersionSwitcher` (always, as long as there's at least one version) → `ReviewMediaViewer` (driven by the active version) → `ReviewDetailBody` + `ReviewDetailSideCard` row → optional `footer({ isLatest })` slot → `ReviewCommentsTimeline` (active version, with `isLatest` flag) → optional `children` slot (modals). Wraps its contents in a `<form>` and wires `onSubmit` to `form.submit()` when the optional `form` prop is provided; otherwise renders a plain `<div>`. Optional slots: `form` (drives edit affordances), `onOpenLinkedScript` (eyebrow + side-card "From script" links), `titleBarActions` (header right-side buttons, e.g. agency Delete), `footer({ isLatest })` (between the body row and the comments timeline — the function shape lets containers hide it when an older version is active), `children` (sibling modals). Status `Banner` always reflects the **latest** version's status, never the currently-viewed historical one, so the page-level cue is stable while you peek at history. The shared `ReviewDetailSideCard` owns the agency-only re-upload UI inline (gated by `useCurrentUser`) — no extras slot. |
| `ReviewDetailHeader` | Eyebrow row (`{type icon} {type label} · {relative date} · From script · {title}`) + title (`Input simple` when `form?.canEdit`, `<h1>` otherwise) + right-side action cluster. The Save button renders when `form?.hasChanges`; the `actions` slot carries everything else (e.g. agency Delete). The "From script" link only renders when `onOpenLinkedScript` is supplied and `form?.canEdit` is false. |
| `ReviewDetailBody` | Left column of the metadata grid: description + dashed-callout client-notes + optional linked-script section. Description / notes flip between `TextArea simple` and plain text based on `form?.canEdit`. The linked-script section renders only when the caller passes the `linkedScriptField?: ReactNode` slot (agency-only — the shared body never imports `LinkedScriptField` itself). |
| `ReviewDetailSideCard` | Right column: type / status / (linked script, when an `onLinkedScriptClick` handler is supplied) / uploaded / updated rows. Status renders the generic `Tag` driven by `reviewStatusTo*` maps. **Agency-only inline re-upload**: when `useCurrentUser` identifies the viewer as an agency member, a local `UploadSection` is rendered at the bottom of the card (inside a `border-t border-pale-gray` band). The section reuses the shared [`ReviewFileDropzone`](../src/components/reviews/ReviewFileDropzone.tsx) with the draft's frozen `mediaType`, calls `useUploadReviewVersion` on submit, then `selectVersion(null)` to snap the panel to the freshly-created version. The component takes a `projectUuid` prop so the upload mutation can scope its cache invalidation. |
| `ReviewFileDropzone` | Shared drag-drop area + per-file row with reorder (↑/↓) for carousel. Single-file for video/image. Renders the dropzone surface via `FileUpload`'s `children` render-prop. Consumed by `CreateReviewModal` (agency) and inline by `ReviewDetailSideCard` (agency-only branch). |
| `ReviewVersionSwitcher` | `@floating-ui/react` popover slotted between `ReviewDetailHeader` and `ReviewMediaViewer`. Trigger renders `Version {n} of {N} · uploaded {relative}` (newest = N). Menu lists every version newest-first with the version number + relative date + a per-version status `Tag`. Selecting a row writes `selectVersion(uuid)` on the shared store; the shared panel re-derives the active version on the next render. Always rendered when `activeVersion` exists (single-version drafts show "Version 1 of 1" as an anchor — makes the feature discoverable). |
| `ReviewCommentsTimeline` | Comments thread for the **active** media version. Drives `useListPaginatedReviewComments(activeVersion.uuid)`: infinite-scroll list of top-level comments (newest first), each rendering its nested `replies` recursively via `ReviewCommentItem`. When `isLatest` is `false`, renders a muted ribbon ("you're viewing an earlier version — comments are read-only"), hides the `CreateReviewCommentForm`, and passes `canReply={false}` + `isAgencyViewer={false}` down to each `ReviewCommentItem` so reply and resolve toggles disappear too. Otherwise mounts the composer below the list. Reads the current user via `useCurrentUser` to derive `isAgencyViewer`. Accepts an optional `videoElementRef` for video timecode pins. |
| `ReviewCommentItem` | Single comment card: `ReviewCommentAuthorBadge` · optional clickable video-timecode chip · optional "Resolved" badge · short date + body (`whitespace-pre-wrap`). Footer holds the **Reply** toggle (when `canReply`, i.e. on the latest version) and, for agency viewers on top-level comments, the **Mark as resolved / Reopen** toggle (wired to `useUpdateReviewComment`). Renders its `replies` recursively with a left border + `pl-3` indent; visual indentation is capped at 3 levels. Resolved comments get an `opacity-70` muted treatment. |
| `CreateReviewCommentForm` | `TextArea` (3 rows, max 5000 chars, trimmed) + Send button. Calls `useCreateReviewComment` with the latest version's UUID. Empty-on-submit / too-long inline error; success/error toasts. Optional props: `parentCommentUuid` (reply form), `showTimecodeInput` + `videoElementRef` (renders the "Pin at current time" toggle for video drafts), `onCancel`, `onSubmitted`. |
| `ReviewMediaViewer` | Tiny dispatcher. Switches on `mediaType` and delegates to `ReviewVideoViewer` / `ReviewImageViewer` / `ReviewCarouselViewer`. Optional `videoElementRef` is forwarded only to the video viewer. |
| `ReviewVideoViewer` | `rounded-2xl bg-dark` framed video with status-driven states driven by `latestVersion.videoStreamingStatus`: spinner + "transcoding…" copy during `pending`/`processing`, an inline error frame on `failed` or fatal hls.js error, and a `ReviewVideoPlayer` on `ready`. Legacy versions (`videoStreamingStatus === null`) fall back to the pre-transcode blob fetched via `useShowReviewVersionFile(reviewVersionUuid, 1)` — the player still hosts it, with hls.js disabled. Also calls `useShowReviewVersionCover(reviewVersionUuid)` and passes the resulting object URL down as `posterUrl` so the still frame shows before play and during buffering. The `bg-clear-3` footer shows the media-type label and the duration. |
| `ReviewVideoPlayer` | Custom-controls video player. Wraps the `<video>` element in a focusable container, owns the hls.js lifecycle via `useReviewVersionHlsPlayer`, reads playback state via `useVideoControls`, and renders `ReviewVideoControlsBar` as a fading overlay (idle auto-hide via `useIdleAutoHide`). Forwards the parent's `videoElementRef` so the comments-timeline timecode-pin click handlers still reach the same `<video>`. Optional `posterUrl?: string \| null` prop is forwarded directly to the `<video poster>` attribute. Handles keyboard shortcuts (Space/K, ←/→ ±5s, J/L ±5s, ↑/↓ ±5% volume, M mute, F fullscreen) scoped to the container — never steals keys from the comment composer. Surfaces fatal hls errors to the viewer via `onPlaybackError`. |
| `ReviewVideoControlsBar` | Bottom overlay row over a `bg-gradient-to-t from-dark/80` shroud. Hosts the seek bar, play/pause toggle, mute + hover-reveal volume slider, current/total time, and the fullscreen toggle. |
| `ReviewVideoSeekBar` | Custom range input rendered as three stacked overlays (track / `bufferedEnd` / `currentTime`) plus an invisible full-width `<input type="range">` for scrub + accessibility. Pulls top-level commented timecodes from `useListPaginatedReviewComments(reviewVersionUuid)` (same query the comments timeline uses — React Query dedupes) and renders each non-null `videoTimecodeSeconds` as a `bg-yellow` dot the user can click to jump. Hidden marker layer when `videoStreamingStatus === null` (no transcoded duration to align against). |
| `ReviewImageViewer` | `rounded-2xl bg-dark` framed single image with `object-contain` (preserves native aspect, capped at `max-h-[70vh]`). |
| `ReviewCarouselViewer` | Stateful active-slide viewer inside the `rounded-2xl bg-dark` frame: left/right arrow buttons (disabled at the ends), top-right slide counter, dot indicators, and a `bg-clear-3` thumbnail strip (active thumb has a `border-dark` ring). Renders one private `CarouselSlideImage` per slide for both the active frame and each thumb — React Query dedupes via the `versionFile` query key. |

### Agency-only (`front/src/components/agency/reviews/`)

| Component | Role |
|---|---|
| `AgencyReviewsPage` | Top-level orchestrator for the agency surface. Reads `selectedReviewUuid` + the create-panel toggle from `useReviewsStore`, renders the shared `ReviewsLayout` with `onCreateReview={openCreatePanel}` and `detail={<AgencyReviewDetailPanel … />}` when a review is selected, and mounts `CreateReviewModal` alongside. |
| `AgencyReviewDetailPanel` | Loads the review via `useShowReview`, wires `useReviewEditForm`, `useDeleteReview`, and the focus-script store, then renders the shared `ReviewDetailPanel` with `form`, `onOpenLinkedScript` (navigates to `agencyScriptsPath`), `titleBarActions={<Delete />}`, `linkedScriptField={<LinkedScriptField … />}` while editing, and a `ConfirmDeleteDialog` as `children`. The re-upload UI lives inside the shared `ReviewDetailSideCard` (auto-gated by `useCurrentUser`) — no agency-only wrapper component. |
| `CreateReviewModal` | `ModalOverlay` (`w-160`, `max-h-[calc(100vh-80px)]`) hosting the create form in three regions: a **header** (modal title + subtitle), a **scrollable body** (content-type cards → file dropzone → title → description + hint → notes + hint → linked-script field), and a **sticky footer** on `bg-clear-2` holding Cancel + Submit. Driven by `showModal` / `onClose` props. The linked-script field is the shared [`LinkedScriptField`](../src/components/agency/scripts/LinkedScriptField.tsx); when its picker is open the create modal slides to `align="left-of-center"`. Imports `ReviewFileDropzone` from the shared layer. Frontend validates file count + size + MIME before posting. Catches HTTP 409 → script-already-has-review. On success calls `selectReview(uuid)` which auto-closes the panel. |

### Client-only (`front/src/components/client/reviews/`)

| Component | Role |
|---|---|
| `ClientReviewsPage` | Top-level orchestrator for the client surface. Reads `selectedReviewUuid` from `useReviewsStore` and renders the shared `ReviewsLayout` with `detail={<ClientReviewDetailPanel … />}`. No create modal, no `onCreateReview`. |
| `ClientReviewDetailPanel` | Loads the review via `useShowReview`, wires `useApproveReviewVersion` + the toast store, then renders the shared `ReviewDetailPanel` with `footer={<ClientReviewActionsBar />}`. No `form` or `linkedScriptField` props → the shared panel renders in read-only mode. |
| `ClientReviewActionsBar` | Status-driven footer: renders the Approve button when the latest version is `Pending`, nothing otherwise. The client signals revisions purely by posting on the comment thread mounted inside `ReviewDetailPanel`. |

### Shared blob-fetching hooks

| Hook | Role |
|---|---|
| `useShowReviewVersionFile(reviewVersionUuid, index)` | React Query hook that fetches a stored upload as a blob via `httpClient` (`GET /review-versions/files?reviewVersionUuid=&index=`) and exposes a `fileUrl` (an `URL.createObjectURL` blob URL, revoked on unmount). Backing query key: `reviewsQueryKeys.versionFile(reviewVersionUuid, index)`. Used by image / carousel viewers and the legacy fallback path of `ReviewVideoViewer`. |

### HLS playback

| Hook | Role |
|---|---|
| `useReviewVersionHlsPlayer({ videoElementRef, reviewVersionUuid, enabled })` | Wraps the [`hls.js`](https://github.com/video-dev/hls.js) lifecycle for `ReviewVideoPlayer`. On `enabled`, attaches an `Hls` instance to the referenced `<video>` element and points it at `GET /api/review-versions/{reviewVersionUuid}/stream/master.m3u8`. The path-style backend route means relative variant / segment URLs inside the playlists resolve naturally — no custom loader needed. `xhrSetup` toggles `withCredentials` so session cookies travel with each request. Falls back to native HLS (`canPlayType('application/vnd.apple.mpegurl')`) when `Hls.isSupported()` is false. Destroys the `Hls` instance on unmount / dep change. Returns `{ error }` — non-null only on fatal hls.js errors. |
| `useVideoControls({ videoElementRef, containerRef })` | Generic — subscribes to the `<video>` element's events (`play`, `pause`, `timeupdate`, `durationchange`, `volumechange`, `progress`, `waiting`, `playing`, `canplay`) plus `document.fullscreenchange`. Returns playback state (`isPlaying`, `isMuted`, `volume`, `currentTime`, `duration`, `bufferedEnd`, `isBuffering`, `isFullscreen`) and stable action callbacks (`play`, `pause`, `togglePlayPause`, `seekTo`, `seekBy`, `setVolume`, `toggleMute`, `toggleFullscreen`). `toggleFullscreen` requests on the container so the controls overlay stays composited in fullscreen. |
| `useIdleAutoHide({ activityRef, isActive, delayMs? })` | Generic — `mousemove`/`mouseleave` on `activityRef`; returns `isHidden` after `delayMs` (default 2500) of stillness. Forced visible (`isHidden = false`) when `isActive` is false. Used by `ReviewVideoPlayer` to fade the controls bar. |

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
- `GET /api/review-versions/{reviewVersionUuid}/stream/{path}` — HLS artifacts under the media version's `stream/` directory. `path` is `master.m3u8`, `1080p/index.m3u8`, `720p/segment_001.ts`, etc. (Symfony route requirement `.+` allows the embedded slash.) Only `.m3u8` and `.ts` accepted. Consumed by hls.js (driven by `useReviewVersionHlsPlayer`) when `videoStreamingStatus === ready`. hls.js handles requests for every artifact directly — relative URLs inside the playlists resolve against the manifest URL with no client-side rewriting.

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

### Components

See the unified [Components](#components) section above. The `/client/reviews` route mounts `ClientReviewsPage` (the client-owned top-level Page), which composes the shared `ReviewsLayout` with `<ClientReviewDetailPanel />` in its `detail` slot. The detail panel loads the review, wires `useApproveReviewVersion`, and feeds `ClientReviewActionsBar` into the shared `ReviewDetailPanel` via its `footer` slot. Since no `form` or `linkedScriptField` slot is provided, the shared `ReviewDetailHeader` / `ReviewDetailBody` render in read-only mode automatically.

### i18n

- `reviews` namespace gains a `comments.*` block (timeline title, version label, uploaded-on, pluralized comment count, no-comments fallback, unknown-author fallback, composer placeholder / submit / cancel / inline errors / toasts, plus the reply / resolve / reopen labels, the "Resolved" / "Open" status badges, the "Pin at current time" / "Pinned at {{time}}" / "Clear pin" composer chips, and `comments.update.toast.*` success / error copy for the PATCH endpoint). Used by both surfaces via the shared timeline + composer + item.
- `clientReviews` namespace covers what's truly client-only: page chrome (no-selection empty state), the Approve action label, and the approve toasts.

Error code map (`front/src/services/apiErrorHandler/errorCodeMessages.ts`): direct one-to-one mappings for every Review comment exception — `33008` → `errors:review.notPending`, `33010` → `errors:review.notLatestVersion`, `33011` → `errors:review.commentEmpty`, `33014` → `errors:review.commentParentNotFound`, `33015` → `errors:review.commentReplyCannotHaveTimecode`, `33016` → `errors:review.commentNotFound`, `33017` → `errors:review.commentStatusInvalid`, `33018` → `errors:review.commentStatusOnReplyForbidden`, `33019` → `errors:review.commentEditForbidden`, `33020` → `errors:review.commentTimecodeOnReplyForbidden`. No resolver functions — each error has a single user-facing message (matches the project convention: one exception per error condition).

## Phase 3 — re-upload + version history + unresolved counter

Phase 3 adds three surface-level capabilities on top of the Phase 1+2 base, with no schema change and no new exceptions.

### Re-upload (agency-only)

Re-upload lives **inline** at the bottom of the shared `ReviewDetailSideCard` — no agency-only wrapper component, no `extras` slot. The side card uses `useCurrentUser` to detect agency viewers and renders an `UploadSection` (local helper) only for them. The section is **persistent** — always visible regardless of the latest version's status, so the agency can upload a new version while a draft is `Pending`, already `Approved`, or `Rejected`. It reuses the shared `ReviewFileDropzone` driven by the draft's frozen `mediaType` (`video` / `image` / `carousel`). On success, `useUploadReviewVersion` writes the new wrapper into the detail cache, then `selectVersion(null)` snaps the panel to the freshly-uploaded latest version (with its empty thread + `unresolvedCommentsCount: 0`).

### Version history switcher

`ReviewDetailPanel` derives an **active version** from `useReviewsStore().selectedVersionUuid` (falls back to `latestVersion`). When `versions.length > 1`, `ReviewVersionSwitcher` is mounted between the header and the media viewer. Picking an older version:

- Swaps the `ReviewMediaViewer` to that version's UUID (image / carousel files + HLS playlists / pre-transcode fallback all key off `reviewVersion.uuid`, so blob caches stay tidy).
- Switches `ReviewCommentsTimeline` to that version's thread (`useListPaginatedReviewComments(activeVersion.uuid)`).
- Renders a "you're viewing an earlier version — comments are read-only" ribbon and hides the composer, reply toggle, and resolve/reopen actions.
- For the client surface: `ClientReviewActionsBar` is conditionally rendered via the `footer({ isLatest })` slot, so Approve / Request changes only appear on the latest version.

The status `Banner` keeps reading `reviewDTO.currentStatus` (= the latest version's status), so the page-level state cue doesn't shift when you peek at history.

### Unresolved-comments counter on `ReviewTile`

The `reviewDTO.unresolvedCommentsCount` field (top-level open comments on the latest version, computed server-side) drives a yellow-palette `Tag` rendered next to the status tag on each tile. Replies don't count; switching to an older version doesn't change the count; uploading a new version resets it to `0`.

## Out of scope (next phases)

- Backlink to a published Post — Phase 4.
- Subscription-tier gating on version history — Phase 5.
