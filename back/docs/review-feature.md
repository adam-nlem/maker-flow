# Review Feature (Backend)

## Overview

Agency-side workflow for uploading content (video, single image, image carousel) and tracking client review status. Sits between `Script` (planning) and `Post` (published on a platform):

```
Script (1‑1) Review (1‑N) ReviewVersion
                  |
                  | Phase 4 backlink (not in Phase 1)
                  v
              Post (N‑1) Review
```

A `ReviewVersion` models **one upload iteration of media files** for a draft: each upload action creates a new row and files are stored on disk indexed `1..N` with their original extensions. **Each media version carries its own review status** (`Pending` / `Approved` / `Rejected`) — the "draft's current status" is the latest version's status. This per-version model means that when Phase 3 introduces re-uploads, a new media version will start fresh at `Pending` while older versions keep their historical statuses (and the per-version comment threads attached to them).

Phase 1 shipped the agency-side surface (create, list, show, update, delete). Phase 2 adds the client-side review action (`POST .../approve`) and the per-version comment thread — the client signals desired revisions purely by posting comments via `POST /api/review-comments`.

## Entities

### `Review` (`src/Entity/Review.php`)

| Field | Type | Notes |
|---|---|---|
| `uuid` | GUID | Public identifier |
| `title` | string(255) | Required |
| `description` | text, nullable | Future social caption |
| `notes` | text, nullable | Agency → client context |
| `mediaType` | `App\Entity\Enum\MediaType` | Reused from `Post.mediaType` (`Video`/`Image`/`Carousel`) |
| `project` | ManyToOne `Project` | NOT NULL, cascade delete |
| `script` | OneToOne `Script` | Nullable, `SET NULL` on script delete, **DB unique constraint** — at most one draft per script |
| `createdBy` | ManyToOne `User` | Nullable, `SET NULL` |
| `versions` | OneToMany `ReviewVersion` | Cascade remove, orphan removal, ordered by `createdAt ASC` |
| `createdAt` / `updatedAt` | DateTimeImmutable | Lifecycle callbacks |

### `ReviewVersion` (`src/Entity/ReviewVersion.php`)

| Field | Type | Notes |
|---|---|---|
| `uuid` | GUID | Public identifier — used in stream URL and the approve endpoint |
| `review` | ManyToOne (`inversedBy: 'versions'`) | NOT NULL, cascade delete |
| `fileCount` | smallint | Set at upload time, lets the API expose carousel size without scanning disk |
| `status` | `App\Entity\Enum\ReviewStatus` | NOT NULL, default `Pending`. Only transition: `Pending → Approved` (via the client approve action). Comments do not change the status — the client just posts on the version's comment thread when revisions are needed; a fresh upload starts a new version at `Pending`. |
| `videoStreamingStatus` | `App\Entity\Enum\VideoStreamingStatus`, nullable | `pending`/`processing`/`ready`/`failed`. Set to `pending` on create when `mediaType === Video`. Stays `null` for image / carousel media versions and for legacy pre-2026-05-19 rows. |
| `videoStreamingFailureReason` | `App\Entity\Enum\VideoStreamingFailureReason`, nullable | Populated by `ReviewVideoProcessingFailedSubscriber` when status flips to `failed`. Values: `invalid_source`, `processing_error`. |
| `durationSeconds` | int, nullable | Probed via `ffprobe` synchronously at upload time for `MediaType::Video`. Null for image / carousel media and for legacy pre-limit rows. Aggregated by `ReviewVersionRepository::sumVideoSecondsByAgency()` to enforce the `max_video_upload_hours` plan limit. |
| `fileSizeBytes` | bigint, nullable | Sum of bytes of all uploaded files for the version, captured at upload time. Null for legacy pre-limit rows. Aggregated by `ReviewVersionRepository::sumStorageBytesByAgency()` to enforce the `max_storage_gb` plan limit. |
| `comments` | OneToMany `ReviewComment` | Cascade remove, orphan removal, ordered by `createdAt ASC`. Each version owns its own feedback thread; comments are created exclusively via `POST /api/review-comments` (no side-effect on the version status). |
| `createdAt` | DateTimeImmutable | |

No `MediaFile` entity. Files live on disk only — see [Storage layout](#storage-layout).

### `ReviewComment` (`src/Entity/ReviewComment.php`)

| Field | Type | Notes |
|---|---|---|
| `uuid` | GUID | Public identifier |
| `reviewVersion` | ManyToOne (`inversedBy: 'comments'`) | NOT NULL, cascade delete |
| `parentComment` | ManyToOne self (`inversedBy: 'replies'`), nullable, cascade delete | When set, the comment is a reply. Fully threaded — a reply can itself have replies. Immutable after creation (the update endpoint never touches threading). |
| `replies` | OneToMany self (`mappedBy: 'parentComment'`) | Direct children, ordered by `createdAt ASC`, cascade remove + orphan removal. Recursively serialized inside the same response groups. |
| `author` | ManyToOne `User`, nullable, `SET NULL` | Comment author at time of submission. Survives author deletion. Serialized with the `api_review_comments_list` group exposing `uuid` + `firstName` + `lastName` + `email`. |
| `body` | text | The feedback text. Trimmed, must be non-empty, max 5000 chars. |
| `status` | `App\Entity\Enum\ReviewCommentStatus` | NOT NULL, default `Open`. Only **top-level** comments carry a meaningful status — replies inherit the value but never mutate it (the update endpoint rejects status changes on replies). Values: `open`, `resolved`. |
| `videoTimecodeSeconds` | float, nullable | When set on a video media version, pins the comment to a moment (in seconds, sub-second precision allowed). **Top-level only** — the create endpoint rejects timecodes on replies, and the update endpoint rejects timecode mutations on replies. Stays `null` for image / carousel media versions (frontend simply hides the input). |
| `createdAt` | DateTimeImmutable | |

## Storage layout

All agency-owned uploads share a single root, scoped by `agencyUuid`:

```
private/uploads/agency/
  └── {agencyUuid}/
        ├── logo/
        │     └── {agencyUuid}.png
        └── reviews/
              └── {reviewVersionUuid}/
                    ├── 1.{ext}              # original upload — deleted after a video is successfully transcoded
                    ├── 2.{ext}              # carousel uploads only
                    ├── cover.jpg            # video uploads only, single frame extracted at t=1s
                    └── stream/              # video uploads only, populated by the HLS transcoder
                          ├── master.m3u8
                          ├── 1080p/index.m3u8 + segment_NNN.ts
                          ├── 720p/index.m3u8  + segment_NNN.ts
                          └── 480p/index.m3u8  + segment_NNN.ts
```

- Filenames are **1-based integers** in the order they arrived in the multipart request. Carousel ordering is the integer in the filename — no DB row, no JSON, no index column.
- Image and carousel files are stored as-is with their original extension; nothing is transcoded server-side.
- Video uploads are stored as-is **temporarily**, then the worker generates the `stream/` subtree (see [Async video streaming](#async-video-streaming)) and **the original `1.{ext}` is removed** so a single video doesn't keep 4 copies of itself on disk.
- Both `AgencyLogoService` and `ReviewFileService` are wired with the same container parameter `app.uploads.agency_root` (`%kernel.project_dir%/private/uploads/agency`) and derive their per-agency sub-paths from it. The review service walks `reviewVersion → review → project → agency` to resolve the agency UUID at runtime.
- **Breaking change (2026-05-14):** agency logos previously lived at `private/uploads/agency/logo/{agencyUuid}.png`. They now sit under the agency-rooted layout above. Pre-existing files need to be re-uploaded or moved manually.

## API endpoints

Base path: `/api/reviews`. All routes require an authenticated user. Object-level checks via `ProjectVoter`.

| Method + path | Role gate | Voter | Purpose |
|---|---|---|---|
| `GET /api/reviews?projectUuid=&page=&limit=&status=&searchTerm=` | `User` (auth only) | `PROJECT_VIEW` on the project | Paginated list (flat array, FE detects "has more" via `lastPage.length === limit`), focused project. Reachable by **agency Viewer+ and clients on their own project** — the role gate is just authentication; the actual ownership check lives in the voter. Optional `status` filters drafts by their **latest media version's** status (correlated subquery on `MAX(createdAt)`). Allowed values: `pending`, `approved`, `rejected`. `searchTerm` is a case-insensitive `LIKE %term%` on `title`. Empty / unknown values are ignored. |
| `GET /api/reviews/awaiting-current-user-action?projectUuid=&page=&limit=` | `User` (auth only) | `PROJECT_VIEW` on the project | Paginated list (same response shape as `api_reviews_list` under the `api_reviews_awaiting_current_user_action` group) of reviews whose **latest version** is `Pending` **and** on which the currently authenticated user has not yet posted any comment. Mirrors the `/api/review-comments/pending` pattern (dedicated route + dedicated `ReviewRepository::getByProjectAwaitingUserActionPaginated()`). Powers the Client home `HomeAwaitingClientActionPanel`. |
| `GET /api/reviews/{uuid}` | `User` (auth only) | `PROJECT_VIEW` on the draft's project | Detail. Returns the Review with a top-level `latestVersion` field **and a `review.versions[]` array (every `ReviewVersion` ordered `createdAt ASC`, full version fields, **no comments**)**. Same gate rationale as the list. |
| `POST /api/reviews` | `Editor` | `PROJECT_EDIT` | **Multipart**. Form fields: `projectUuid`, `title`, `mediaType` (`video`/`image`/`carousel`), optional `description`, `notes`, `scriptUuid`. Files in `files[]` (1 for video/image, 2–10 for carousel). The new `ReviewVersion` is created with `status = Pending` via its constructor default. Returns the same shape as the show route. |
| `POST /api/review-versions` | `Editor` | `PROJECT_EDIT` on the targeted review's project | **Multipart**. Form fields: `reviewUuid` (text, required — the parent draft) + `files[]`. `mediaType`, `title`, `description`, `notes`, `scriptUuid` are immutable at `Review` level and cannot be re-sent. Validation reuses `ReviewFileService` (same `FileInvalidReason` codes via `ReviewFileInvalidException`, 33001). Creates a new `ReviewVersion` with `status = Pending` and, when `Review.mediaType === Video`, `videoStreamingStatus = Pending` + a fresh `ProcessReviewVideoMessage` dispatch. No state-machine guard — agency editors can upload a new version regardless of the current latest status. Returns the same shape as the show route under the `api_review_versions_create` group. Lives in **`ReviewVersionController`** (flat-URL convention shared with `POST /api/review-comments`: parent identifier in the body, not the path). |
| `PATCH /api/reviews/{uuid}` | `Editor` | `PROJECT_EDIT` | JSON. Updatable fields: `title`, `description`, `notes`, `scriptUuid` (any can be set to `null`). Allowed only when the **latest media version's** status is `Pending`. Returns the same shape as the show route. |
| `DELETE /api/reviews/{uuid}` | `Editor` | `PROJECT_EDIT` | Returns `200` + `{"message": "Review deleted successfully"}`. Doctrine cascade removes media versions (and their comments); a `ReviewVersionDiskCleanupListener` (`preRemove`) handles on-disk cleanup automatically. |
| `GET /api/review-versions/files?reviewVersionUuid=&index=` | `User` (auth only) | `PROJECT_VIEW` on the media version's draft's project | Lives in **`ReviewVersionController`** (separate from `ReviewController`). Both params travel via the query string (`StreamFileQueryParamDTO`: `reviewVersionUuid` UUID + `index` positive int). Streams the corresponding stored file — extension globbed at runtime. Returns `BinaryFileResponse` with `DISPOSITION_INLINE`; range requests handled automatically. Used for image / carousel files and (pre-transcode) the original video. Returns 404 when the index is out of range or the file is missing on disk. For videos with `videoStreamingStatus === ready` this endpoint 404s — the original has been deleted; use the `/stream` endpoint instead. Reachable by both agency members and clients (voter scopes by project ownership). |
| `GET /api/review-versions/{reviewVersionUuid}/cover` | `User` (auth only) | `PROJECT_VIEW` on the media version's draft's project | Serves the JPEG cover frame for the version's video. Returns `BinaryFileResponse` with `Content-Type: image/jpeg`, `DISPOSITION_INLINE`. Returns 204 No Content when the cover is missing on disk (matches the agency-logo behavior — e.g. cover extraction failed, or the version is not a video). Reachable by both agency members and clients (voter scopes by project ownership). |
| `GET /api/review-versions/{reviewVersionUuid}/stream/{path}` | `User` (auth only) | `PROJECT_VIEW` on the media version's draft's project | Path-style route (`reviewVersionUuid` as UUID requirement; `path` requirement `.+` so embedded slashes like `1080p/index.m3u8` match). Serves any HLS artifact (master playlist, variant playlist, `.ts` segment) under the media version's `stream/` directory. Only `.m3u8` and `.ts` are accepted — anything else 404s. `realpath`-based path-traversal guard. `Content-Type` is set explicitly (`application/vnd.apple.mpegurl` / `video/mp2t`). The path-style URL design lets hls.js (and native HLS players) resolve relative URLs inside the playlists naturally — no client-side URL rewriting required. Reachable by both agency members and clients. |
| `POST /api/review-versions/{reviewVersionUuid}/approve` | `Client` (`ROLE_CLIENT`) | `PROJECT_VIEW` on the version's draft's project | Empty body. Transitions `reviewVersion.status` from `Pending` → `Approved`. Returns 409 with `ReviewVersionNotLatestException` (33010) if the version is no longer the latest, or `ReviewVersionNotPendingException` (33008) if its status is not `Pending`. Returns the same shape as the show route. |
| `GET /api/review-comments?reviewVersionUuid=&page=&limit=` | `User` (auth only) | `PROJECT_VIEW` on the version's draft's project | Paginated top-level comments for a media version (replies still nested recursively inside each top-level comment via the `api_review_comments_list` group). Flat array, sorted `createdAt DESC` (newest first). Default `limit=20`. FE detects "has more" via `lastPage.length === limit`. |
| `POST /api/review-comments` | `User` (auth only) | `PROJECT_VIEW` on the version's draft's project | Lives in **`ReviewCommentController`** (separate from `ReviewVersionController` because the comment is its own entity). The route follows the create convention used elsewhere (e.g. `POST /api/reviews`): a flat resource URL with the parent identifier carried in the JSON body. Body: `{ "reviewVersionUuid": UUID, "body": "non-empty string", "parentCommentUuid"?: UUID, "videoTimecodeSeconds"?: float >= 0 }`. Validation is declarative on the DTO (`#[Assert\NotBlank]`, `#[Assert\Length(max: 5000)]`, `#[Assert\Uuid]`, `#[Assert\Type('numeric')]`, `#[Assert\PositiveOrZero]`); the controller calls `$dto->build()` to obtain the pre-populated `ReviewComment` then attaches author, media version, and (when present) parent / timecode. **Open to both agency members and clients** — the comment thread is bidirectional: clients leave feedback when requesting changes, the agency replies in the same thread. Creates a `ReviewComment` (author = current user) on the version, **does not change status**. When `parentCommentUuid` is set, the new comment is a reply (any depth); the controller checks the parent exists and belongs to the same media version. Replies **cannot** carry a `videoTimecodeSeconds` — both together → 400 `ReviewCommentReplyCannotHaveTimecodeException` (33015). 404 `ReviewCommentParentNotFoundException` (33014) for unknown / cross-version parent UUID. 409 `ReviewVersionNotLatestException` (33010) if the version is no longer the latest. Returns the same shape as the show route (the new comment is not in the response — frontend invalidates the comments list query). |
| `GET /api/review-comments/pending?projectUuid=&page=&limit=` | `User` (auth only) | `PROJECT_VIEW` on the project | Project-scoped overview powering the agency home widget. Returns the **reviews of the project whose latest version has at least one open top-level comment**, grouped with that latest version's open top-level comments inlined under each review. Flat array of `ListReviewCommentsGroupedByReviewResponseDTO` (`{ review: ReviewWithLatestVersionResponseDTO, comments: ReviewComment[] }`), reviews ordered `updatedAt DESC`, comments ordered `createdAt ASC` within each review (oldest unresolved feedback first). Replies, resolved comments, and comments on superseded versions are excluded. Mirrors the purpose-specific sibling pattern of `GET /api/posts/rank` / `GET /api/scripts/calendar`. Serialization group: `api_review_comments_pending`. |
| `PATCH /api/review-comments/{uuid}` | `User` (auth only) | `PROJECT_VIEW` on the comment's draft's project + per-field checks below | Partial update on an existing comment, presentFields-style DTO (matches `UpdateReviewRequestDTO`). Body: any subset of `{ "body"?: string, "status"?: "open"\|"resolved", "videoTimecodeSeconds"?: float\|null }`. Threading (`parentComment`) is immutable and never exposed by the endpoint. **Per-field permission rules:** `body` and `videoTimecodeSeconds` are editable only by the comment **author** — otherwise 403 `ReviewCommentEditForbiddenException` (33019). `status` is editable only by **agency editors** (additional `PROJECT_EDIT` check). `status` and `videoTimecodeSeconds` mutations on a reply both 409 (`ReviewCommentStatusOnReplyForbiddenException` 33018, `ReviewCommentTimecodeOnReplyForbiddenException` 33020). `videoTimecodeSeconds: null` clears the pin; the value is otherwise validated as `>= 0`. Empty body → 400 `ReviewCommentEmptyException` (33011). Unknown `status` → 400 `ReviewCommentStatusInvalidException` (33017). 404 `ReviewCommentNotFoundException` (33016) if the UUID is unknown. Returns the same shape as the show route (frontend invalidates the comments list query). |

### Response shape

Responses are wrapped in a single dedicated **Response DTO** under `src/DTO/Response/Review/` (matching the `PostWithPlatformAndInsightsResponseDTO` / `PostGroupWithInsightsAndScriptResponseDTO` pattern: one DTO carrying combined groups, controllers pick the right group via context) for the Review-shaped payloads, while `ReviewVersion` and `ReviewComment` are serialized via narrowed `#[Groups]` on the entity itself.

- `ReviewWithLatestVersionResponseDTO` — used by **every** Review-shaped endpoint: `GET /api/reviews` (list), `GET /api/reviews/{uuid}` (show), create / update, approve, version-create, comment-create / comment-update. Constructor-injected `{review, latestVersion, unresolvedCommentsCount}`, with the wrapper tagged with **all** the groups the project uses so the same DTO serializes correctly under whichever context the controller passes. Per the project convention the group name matches the route name — each endpoint passes its own group; the alternates are listed alongside `api_reviews_show` on the relevant `Review`, `ReviewVersion`, and `Script` properties + on `ReviewWithLatestVersionResponseDTO`. Field selection is driven by the **entity-level** `#[Groups]` on `Review` / `ReviewVersion` / `Script`:
  - `api_reviews_list` (used by `GET /api/reviews`) → `review.{uuid, title, mediaType, createdAt}` + `latestVersion.{uuid, fileCount, status, videoStreamingStatus, videoStreamingFailureReason}` + `unresolvedCommentsCount` (no `latestVersion.createdAt`, no `comments`, no `script`, no `description` / `notes` / `updatedAt`, no `review.versions`).
  - `api_reviews_show` (used by `GET /api/reviews/{uuid}`) → adds `review.{description, notes, updatedAt, script, versions}` and `latestVersion.createdAt`. `script` is the `Script` entity exposed as `uuid + title`. `versions` is the full collection of `ReviewVersion` rows for the draft (ordered `createdAt ASC`) — drives the per-version switcher in the UI.
  - `api_reviews_create` (create), `api_reviews_update` (update), `api_review_versions_approve` (approve), `api_review_versions_create` (version-create), `api_review_comments_create` (comment-create), `api_review_comments_update` (comment-update) → same full field set as `api_reviews_show`.
- `unresolvedCommentsCount` is computed by `ReviewCommentRepository::countOpenTopLevelForVersion(latestVersion)` and counts **top-level** `ReviewComment` rows on the **latest** `ReviewVersion` with `status = Open`. Replies and historical-version comments are excluded — a freshly-uploaded version resets the count to `0`. The list endpoint runs the equivalent aggregate (`getOpenTopLevelCountsForLatestVersions`) once for the whole page to avoid N+1.
- `ListReviewCommentsGroupedByReviewResponseDTO` (`src/DTO/Response/Review/`) — used only by `GET /api/review-comments/pending`. Wraps `{ review: ReviewWithLatestVersionResponseDTO, comments: ReviewComment[] }` so the home widget gets reviews + their open top-level comments in one round-trip. Same DTO-shaped-grouping pattern as `ListScriptsGroupedByDayResponseDTO` for `GET /api/scripts/calendar`. Backed server-side by `ReviewRepository::getByProjectWithPendingCommentsPaginated()` (filters reviews to those with at least one open top-level comment on their latest version) + `ReviewCommentRepository::getOpenTopLevelForLatestVersionByReviews()` (bulk-fetches the actual comments keyed by review id). The serialization group `api_review_comments_pending` is added alongside `api_reviews_list` on the `Review` / `ReviewVersion` fields the widget needs (uuid, title, mediaType, createdAt, version uuid / status / streaming fields) and alongside `api_review_comments_list` on every `ReviewComment` field **except `replies`** (the home widget renders top-level feedback only — replies are deliberately omitted from the pending payload) and on the nested `User` / `Agency` / `Project` author fields exposed there (`uuid`, `firstName`, `lastName`, `email`, `agency.{uuid, name}`, `project.{uuid, name}`) so the home widget can render the author's name and agency logo — no duplicated field declarations.
- `ReviewComment` is serialized via the `api_review_comments_list` group on `GET /api/review-comments`: `uuid`, `body`, `status`, `videoTimecodeSeconds`, `createdAt`, `author.{uuid, firstName, lastName, email}`, `parentCommentUuid` (virtual getter), and the recursive `replies` collection (same group, ordered `createdAt ASC` inside a thread via the existing `#[OrderBy]` on the mapping).
- The list endpoint returns a flat array of `ReviewWithLatestVersionResponseDTO` serialized with the `api_reviews_list` context. The comments list endpoint returns a flat array of `ReviewComment` entities. Pagination follows the existing convention used by `GET /api/reviews` / `GET /api/scripts`: no envelope; the FE detects "has more" by comparing `lastPage.length` to the requested `limit`.

There is **no `ReviewService`** — the controller composes the create / update / delete flows itself (DTO → repositories → file service → flush), matching the pattern used in `UserController::register`, `AgencyController::uploadLogo`, etc.

### Cascade delete + disk cleanup

Full Doctrine ORM cascade chain: `Project → Review → ReviewVersion`, all with `cascade: ['remove']` + `orphanRemoval: true`. DB-level `ON DELETE CASCADE` on the FKs is the belt-and-suspenders fallback for raw-SQL deletes.

- Deleting a `Review` via the controller (`$reviewRepository->remove($review, true)`) iterates `versions` via the ORM cascade and fires `preRemove` on each `ReviewVersion`.
- Deleting a `Project` via `ProjectController::delete` (`$projectRepository->remove($project, true)`) iterates `reviews` via the ORM cascade, which in turn iterates each draft's `versions` — the same `preRemove` fires.

The **`ReviewVersionDiskCleanupListener`** entity listener (wired in `config/services.yaml`) catches `preRemove` on `ReviewVersion` and calls `ReviewFileService::deleteReviewVersion($reviewVersion)` to wipe the on-disk directory. Whether the trigger is a draft delete or a project delete, the disk gets cleaned up.

### Upload constraints (enforced by `ReviewFileService`)

| Media type | File count | MIME types | Max size per file |
|---|---|---|---|
| Video | exactly 1 | `video/mp4`, `video/quicktime`, `video/webm` | 500 MB |
| Image | exactly 1 | `image/png`, `image/jpeg`, `image/webp` | 20 MB |
| Carousel | 2–10 | `image/png`, `image/jpeg`, `image/webp` | 20 MB each |

Violations throw `ReviewFileInvalidException` (HTTP 400) carrying a `FileInvalidReason` enum value in `meta.reason` (one of `file_too_large`, `invalid_mime_type`, `too_many_files`, `too_few_files`, `missing_file`, `invalid_payload`). `FileInvalidReason` is the shared enum used by every file-upload validation exception across the app.

### Other typed errors

| Exception | HTTP | Code suffix | Trigger |
|---|---|---|---|
| `MissingReviewException` | 404 | 2 | Draft UUID not found, or `streamFile`/`streamHls` couldn't locate the requested file on disk |
| `ScriptAlreadyHasReviewException` | 409 | 3 | Unique constraint on `review.script_id` violated. On create, the on-disk media version directory is wiped before the exception is rethrown. |
| `ReviewLockedException` | 409 | 4 | Update attempted while the latest version's status ≠ `Pending` |
| `UnresolvableReviewVersionAgencyException` | 500 | 5 | A `ReviewVersion` cannot resolve its owning agency through the `review → project → agency` chain (data-integrity failure). |
| `VideoSourceNotFoundException` | 500 | 6 | The HLS worker started processing but the source `1.{ext}` is missing on disk. Surfaces `videoStreamingFailureReason = invalid_source` once retries exhaust. |
| `VideoProcessingFailedException` | 500 | 7 | ffmpeg exited non-zero, an expected HLS artifact is missing, or the original file could not be removed. Surfaces `videoStreamingFailureReason = processing_error`. |
| `ReviewVersionNotPendingException` | 409 | 8 | Approve called while the latest version is not `Pending`. |
| `ReviewVersionNotLatestException` | 409 | 10 | Approve called against a media version that is no longer the latest one of its draft. |
| `ReviewCommentEmptyException` | 400 | 11 | Comment body is missing or empty after trim. |
| `ReviewCommentParentNotFoundException` | 404 | 14 | `parentCommentUuid` on create refers to an unknown comment, or one belonging to a different media version. |
| `ReviewCommentReplyCannotHaveTimecodeException` | 400 | 15 | Create payload sets both `parentCommentUuid` and `videoTimecodeSeconds`. |
| `ReviewCommentNotFoundException` | 404 | 16 | PATCH `{uuid}` does not match a stored comment. |
| `ReviewCommentStatusInvalidException` | 400 | 17 | PATCH body sets `status` to a value not in `ReviewCommentStatus`. |
| `ReviewCommentStatusOnReplyForbiddenException` | 409 | 18 | PATCH tries to mutate `status` on a reply (top-level only). |
| `ReviewCommentEditForbiddenException` | 403 | 19 | A user other than the comment author tries to PATCH `body` or `videoTimecodeSeconds`. |
| `ReviewCommentTimecodeOnReplyForbiddenException` | 409 | 20 | PATCH tries to mutate `videoTimecodeSeconds` on a reply (top-level only). |
| `CoverSourceNotFoundException` | 500 | 21 | The cover extractor started but the source `1.{ext}` is missing on disk. Always swallowed by the handler (logged to Sentry) — never reaches the HTTP layer. |
| `CoverGenerationFailedException` | 500 | 22 | ffmpeg exited non-zero during cover extraction, or the expected `cover.jpg` is missing afterwards. Always swallowed by the handler (logged to Sentry) — never reaches the HTTP layer. |
| `VideoHoursLimitReachedException` | 402 | 23 | Synchronous video-duration probe at upload showed the agency would exceed `max_video_upload_hours`. Raised before the file is persisted — no DB row, no disk write. |
| `StorageLimitReachedException` | 402 | 24 | Total size of the upload would exceed the agency's `max_storage_gb` cap. Applies to videos, single images, and carousels alike. Raised before persistence. |

All exceptions extend `ReviewException` → `DomainCode::Review` (33). Full codes are `33001`–`33024`. **Convention:** each distinct error condition gets its own exception with a fixed code — we do **not** multiplex multiple reasons through a single exception with a `reason` enum in meta.

The two `*Limit*` exceptions are not raised inside `ReviewFileService`; they are thrown by `SubscriptionLimitService` (see `back/docs/billing-feature.md`). The controller orchestrates a thin three-step pipeline:

1. `ReviewFileService::validateFiles($files, $mediaType)` — count / MIME / size validation only (HTTP 400 on failure).
2. `SubscriptionLimitService::assertCanUploadReviewVersion($agency, $files, $mediaType): ReviewUploadMetricsDTO` — composes the upload cost (file-size sum via `ReviewFileService::computeTotalSize` + video duration via `ReviewVideoStreamingService::probeDurationSeconds`), then enforces both `max_video_upload_hours` and `max_storage_gb`. Returns the metrics for the controller to set on the entity.
3. Persist the `ReviewVersion` with `durationSeconds` + `fileSizeBytes` from the metrics, then `ReviewFileService::storeUploadedFiles($version, $files)` moves files to disk.

The split keeps each base service focused: `ReviewFileService` owns file-system concerns (validation + on-disk storage + size summing + path helpers), `ReviewVideoStreamingService` owns `ffmpeg`/`ffprobe` concerns, and `SubscriptionLimitService` owns all upload-cost composition + limit policy. Neither base service depends on the other.

## Async video streaming

Video uploads get a second pass after the synchronous `POST /api/reviews` succeeds:

1. `ReviewController::create` sets `videoStreamingStatus = pending` on the new `ReviewVersion`, flushes, then dispatches `ProcessReviewVideoMessage($reviewVersion->getId())` on the `messages` transport (the existing single RabbitMQ-backed transport — see [rabbitmq-messenger-feature.md](rabbitmq-messenger-feature.md)).
2. `ProcessReviewVideoHandler` loads the entity, flips status to `processing`, then calls `ReviewVideoStreamingService::generateCover()` followed by `ReviewVideoStreamingService::generateHls()`. The cover call is wrapped in its own `try/catch` and reports failures to Sentry via `captureException` without demoting the version — a missing cover never blocks playback. Cover extraction runs **first** because `generateHls()` deletes the original `1.{ext}` source at the end of its successful run.
3. `ReviewVideoStreamingService` shells out to `ffmpeg` (via `Symfony\Component\Process\Process`) with a single command that writes three HLS renditions and the master playlist into the media version's `stream/` subdirectory in one pass:

   | Variant | Height | Video bitrate | Audio bitrate |
   |---|---|---|---|
   | `1080p` | 1080 | 5000 kbps | 128 kbps |
   | `720p`  | 720  | 2800 kbps | 128 kbps |
   | `480p`  | 480  | 1400 kbps | 96 kbps  |

   All variants are always generated regardless of source resolution (deliberate — keeps the player ladder predictable). Segments are 4 s VOD. The service probes the source with `ffprobe` first; if no audio stream is present (e.g. silent screen recordings), the audio map/codec args and the `a:N` entries in `-var_stream_map` are omitted so HLS still produces a valid video-only master + variants.
4. After ffmpeg returns, the service asserts `master.m3u8` and every per-variant `index.m3u8` exist, then `unlink()`s the original `1.{ext}` source file.
5. Handler flips status to `ready` and flushes.

### Cover extraction

`ReviewVideoStreamingService::generateCover()` runs a separate `ffmpeg` invocation that writes a single JPEG frame to `{reviewVersionUuid}/cover.jpg`:

```
ffmpeg -y -ss 1 -i <source> -frames:v 1 -q:v 2 <coverPath>
```

`-ss` before `-i` performs a fast input seek to the 1-second mark, which sidesteps the black frames many sources start with while staying cheap (no decode of preceding frames). The path is owned by `ReviewFileService` via the `COVER_FILENAME` class constant (`cover.jpg`) and the `getCoverPath()` / `getCoverFile()` helpers — no `services.yaml` parameter, since the value is an internal asset name rather than environment-bound config.

### Retry & failure

- The handler catches any `\Throwable` from `generateHls()`, reports it to Sentry via `captureException`, and writes `videoStreamingStatus = failed` plus a `videoStreamingFailureReason` (`invalid_source` if the throwable is a `VideoSourceNotFoundException`, otherwise `processing_error`). It then `return`s normally — no exception escapes, so Messenger does **not** retry.
- Rationale: ffmpeg failures are almost always deterministic (bad input, missing binary, no disk space). Retrying 3× in seven seconds wouldn't help and would just churn the worker. Users can re-upload to retry.
- On failure the original `1.{ext}` is **kept on disk** (we never reached the delete step). The frontend keeps using the existing `/files/{index}` endpoint as a fallback.

### Idempotency

If the same `reviewVersionId` is processed twice (e.g. a worker restart re-queues the message), the handler is a no-op when `videoStreamingStatus === ready`. Otherwise it wipes any partial `stream/` directory and starts fresh.

### Frontend consumption

`videoStreamingStatus` and `videoStreamingFailureReason` are exposed in both `api_reviews_list` and `api_reviews_show` groups. Recommended client behavior:

| Status | UI hint |
|---|---|
| `null` (image / carousel / legacy video) | Use `/files?reviewVersionUuid=&index=N` |
| `pending` / `processing` | Show "video is being prepared", optionally fall back to `/files?reviewVersionUuid=&index=1` for an immediate preview |
| `ready` | Use HLS: `GET /api/review-versions/{reviewVersionUuid}/stream/master.m3u8` (hls.js on Chromium/Firefox/Safari; relative variant + segment paths inside the playlists resolve naturally against the manifest URL) |
| `failed` | Show failure UX based on `videoStreamingFailureReason`; the original is still available via `/files?reviewVersionUuid=&index=1` |

### Operational notes

- ffmpeg ships with both `back/.docker/build/Dockerfile` (dev) and `back/.docker/build/Dockerfile.prod` (runtime stage).
- No `php-ffmpeg/php-ffmpeg` composer dependency — the CLI binary is enough.
- `Process::setTimeout(null)` is intentional; the messenger worker's own `--time-limit` is the practical ceiling.

## Infra

- PHP upload limits are bumped via `back/.docker/build/php-uploads.ini` (`upload_max_filesize = 512M`, `post_max_size = 512M`, `memory_limit = 1024M`, `max_execution_time = 600`).

## Migration

- `back/migrations/Version20260514120000.php` — creates `review` and `review_version`, the unique index on `review.script_id`, and the supporting indexes `(project_id, status)` and `(review_id, created_at)`. No optimization column — files are stored as-is.
- `back/migrations/Version20260519120000.php` — adds nullable `video_streaming_status` and `video_streaming_failure_reason` (`VARCHAR(32)`) columns to `review_version`. Existing rows stay `NULL` (treated as "legacy — use raw file" by the frontend); no backfill.
- **Phase 2 schema changes (manual migration — not committed in this Phase 2 branch, handled outside this repo state):**
  - Drop `review.status` and the `IDX_review_project_status` index.
  - Add `review_version.status VARCHAR(32) NOT NULL` (backfill from each row's parent `review.status`).
  - New supporting index `(status, created_at)` on `review_version`.
  - Create `review_comment` (`id`, `uuid`, `media_version_id` NOT NULL FK CASCADE → `review_version(id)`, `author_id` NULL FK SET NULL → `user(id)`, `body` LONGTEXT, `created_at`) with indexes `(media_version_id, created_at)` and `(author_id)`.
- `back/migrations/Version20260520072327.php` — extends `review_comment` with reply threading + status + nullable video timecode:
  - `parent_comment_id INT NULL FK CASCADE → review_comment(id)` (self-referencing, supporting index `IDX_..._BF2AF943`).
  - `status VARCHAR(32) NOT NULL` (PHP-side default `Open`; the migration uses a transient `DEFAULT 'open'` so it backfills any existing rows then drops the default — keeping the schema consistent with the sibling `ReviewVersion.status` column).
  - `video_timecode_seconds DOUBLE PRECISION NULL`.

## Phase 3 — agency re-upload + version history + unresolved counter

Phase 3 keeps the entities untouched and extends the wire format:

- **New endpoint**: `POST /api/review-versions` on `ReviewVersionController` (Editor + `PROJECT_EDIT`) creates a fresh `ReviewVersion` on an existing draft. Multipart body carries `reviewUuid` (text) + `files[]` — title / description / notes / script / mediaType stay frozen at the `Review` level. Same flat-URL convention as `POST /api/review-comments` (parent identifier in the body, never the path). The new version inherits the draft's `MediaType`, starts at `status = Pending`, and (for video) at `videoStreamingStatus = Pending` with the usual `ProcessReviewVideoMessage` dispatch. **No state-machine guard** — the agency can drop a new version regardless of the current latest status (e.g. revise an already-approved draft).
- **Version history exposure**: `Review.versions` is added to every Review-shaped serialization group **except `api_reviews_list`** (kept trimmed for the sidebar). The frontend uses it to power a version switcher above the media viewer; comments stay scoped to the active version (the comments-list endpoint already takes a `reviewVersionUuid`).
- **Unresolved comments counter**: `ReviewWithLatestVersionResponseDTO` now ships an `unresolvedCommentsCount` field (`int`, present in every group). Definition: count of `ReviewComment` rows on the **latest** `ReviewVersion` where `parentComment IS NULL` and `status = Open`. Two repository helpers back it:
  - `ReviewCommentRepository::countOpenTopLevelForVersion(ReviewVersion)` — single-version path used by show, create, update, approve, version-create, comment-create, comment-update.
  - `ReviewCommentRepository::getOpenTopLevelCountsForLatestVersions(Review[])` — bulk aggregate used by the list endpoint; correlated `NOT EXISTS` subquery picks the latest version per review, then groups by `review_id`. Reviews with no matching open comment are absent from the map (the controller maps them to `0`).

No schema migration, no new exceptions, no new typed errors. Existing `ReviewFileInvalidException` (33001) + `MissingReviewException` (33002) cover the version-create failure modes; the unresolved count is fully derived from existing `review_comment.status` data.

## Out of scope (next phases)

- Phase 4: `Post.review` backlink populated when the linked Script's `PostGroup` gets a published `Post`.
- Phase 5: optional subscription-tier gating for media version history.
