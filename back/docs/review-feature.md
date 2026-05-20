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

A `ReviewVersion` models **one upload iteration of media files** for a draft: each upload action creates a new row and files are stored on disk indexed `1..N` with their original extensions. **Each media version carries its own review status** (`Pending` / `ChangesRequested` / `Approved` / `Rejected`) — the "draft's current status" is the latest version's status. This per-version model means that when Phase 3 introduces re-uploads, a new media version will start fresh at `Pending` while older versions keep their historical statuses (and the per-version comment threads attached to them).

Phase 1 shipped the agency-side surface (create, list, show, update, delete). Phase 2 adds the client-side review actions (`POST .../approve`, `POST .../request-changes`) and the per-version comment thread.

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
| `uuid` | GUID | Public identifier — used in stream URL and the approve / request-changes endpoints |
| `review` | ManyToOne (`inversedBy: 'versions'`) | NOT NULL, cascade delete |
| `fileCount` | smallint | Set at upload time, lets the API expose carousel size without scanning disk |
| `status` | `App\Entity\Enum\ReviewStatus` | NOT NULL, default `Pending`. Transitions: `Pending → Approved` and `Pending → ChangesRequested` (via client actions); `Approved → ChangesRequested` (client undo). `ChangesRequested` is terminal for that version — re-uploads (Phase 3) start a new version. |
| `videoStreamingStatus` | `App\Entity\Enum\VideoStreamingStatus`, nullable | `pending`/`processing`/`ready`/`failed`. Set to `pending` on create when `mediaType === Video`. Stays `null` for image / carousel media versions and for legacy pre-2026-05-19 rows. |
| `videoStreamingFailureReason` | `App\Entity\Enum\VideoStreamingFailureReason`, nullable | Populated by `ReviewVideoProcessingFailedSubscriber` when status flips to `failed`. Values: `invalid_source`, `processing_error`. |
| `comments` | OneToMany `ReviewComment` | Cascade remove, orphan removal, ordered by `createdAt ASC`. Each version owns its own feedback thread; current model exposes a single write path (`request-changes`) which appends one comment per call. |
| `createdAt` | DateTimeImmutable | |

No `MediaFile` entity. Files live on disk only — see [Storage layout](#storage-layout).

### `ReviewComment` (`src/Entity/ReviewComment.php`)

| Field | Type | Notes |
|---|---|---|
| `uuid` | GUID | Public identifier |
| `reviewVersion` | ManyToOne (`inversedBy: 'comments'`) | NOT NULL, cascade delete |
| `parentComment` | ManyToOne self (`inversedBy: 'replies'`), nullable, cascade delete | When set, the comment is a reply. Fully threaded — a reply can itself have replies. Immutable after creation (the update endpoint never touches threading). |
| `replies` | OneToMany self (`mappedBy: 'parentComment'`) | Direct children, ordered by `createdAt ASC`, cascade remove + orphan removal. Recursively serialized inside the same response groups. |
| `author` | ManyToOne `User`, nullable, `SET NULL` | Comment author at time of submission. Survives author deletion. Serialized with the show + action-specific groups (`api_reviews_show`, `api_review_versions_approve`, `api_review_versions_request_changes`, `api_review_comments_create`) exposing `uuid` + `firstName` + `lastName` + `email`. |
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
| `GET /api/reviews?projectUuid=&page=&limit=&status=&searchTerm=` | `User` (auth only) | `PROJECT_VIEW` on the project | Paginated list, focused project. Reachable by **agency Viewer+ and clients on their own project** — the role gate is just authentication; the actual ownership check lives in the voter. Optional `status` filters drafts by their **latest media version's** status (correlated subquery on `MAX(createdAt)`). Allowed values: `pending`, `changes_requested`, `approved`, `rejected`. `searchTerm` is a case-insensitive `LIKE %term%` on `title`. Empty / unknown values are ignored. |
| `GET /api/reviews/{uuid}` | `User` (auth only) | `PROJECT_VIEW` on the draft's project | Detail (includes the full `versions` array with each version's `status` and `comments`). Same gate rationale as the list. |
| `POST /api/reviews` | `Editor` | `PROJECT_EDIT` | **Multipart**. Form fields: `projectUuid`, `title`, `mediaType` (`video`/`image`/`carousel`), optional `description`, `notes`, `scriptUuid`. Files in `files[]` (1 for video/image, 2–10 for carousel). The new `ReviewVersion` is created with `status = Pending` via its constructor default. |
| `PATCH /api/reviews/{uuid}` | `Editor` | `PROJECT_EDIT` | JSON. Updatable fields: `title`, `description`, `notes`, `scriptUuid` (any can be set to `null`). Allowed only when the **latest media version's** status is `Pending`. |
| `DELETE /api/reviews/{uuid}` | `Editor` | `PROJECT_EDIT` | Returns `200` + `{"message": "Post draft deleted successfully"}`. Doctrine cascade removes media versions (and their comments); a `ReviewVersionDiskCleanupListener` (`preRemove`) handles on-disk cleanup automatically. |
| `GET /api/review-versions/files?reviewVersionUuid=&index=` | `User` (auth only) | `PROJECT_VIEW` on the media version's draft's project | Lives in **`ReviewVersionController`** (separate from `ReviewController`). Both params travel via the query string (`StreamFileQueryParamDTO`: `reviewVersionUuid` UUID + `index` positive int). Streams the corresponding stored file — extension globbed at runtime. Returns `BinaryFileResponse` with `DISPOSITION_INLINE`; range requests handled automatically. Used for image / carousel files and (pre-transcode) the original video. Returns 404 when the index is out of range or the file is missing on disk. For videos with `videoStreamingStatus === ready` this endpoint 404s — the original has been deleted; use the `/stream` endpoint instead. Reachable by both agency members and clients (voter scopes by project ownership). |
| `GET /api/review-versions/stream?reviewVersionUuid=&path=` | `User` (auth only) | `PROJECT_VIEW` on the media version's draft's project | `reviewVersionUuid` + `path` via query string (`StreamHlsQueryParamDTO`). Serves any HLS artifact (master playlist, variant playlist, `.ts` segment) under the media version's `stream/` directory. Only `.m3u8` and `.ts` are accepted — anything else 404s. `realpath`-based path-traversal guard. `Content-Type` is set explicitly (`application/vnd.apple.mpegurl` / `video/mp2t`). Reachable by both agency members and clients. |
| `POST /api/review-versions/{reviewVersionUuid}/approve` | `Client` (`ROLE_CLIENT`) | `PROJECT_VIEW` on the version's draft's project | Empty body. Transitions `reviewVersion.status` from `Pending` → `Approved`. Returns 409 with `ReviewVersionNotLatestException` (33010) if the version is no longer the latest, or `ReviewVersionNotPendingException` (33008) if its status is not `Pending`. Returns the **parent draft** serialized with `api_review_versions_approve` — the frontend hydrates its detail cache directly from the response. |
| `POST /api/review-versions/{reviewVersionUuid}/request-changes` | `Client` (`ROLE_CLIENT`) | `PROJECT_VIEW` on the version's draft's project | JSON body `{ "comment": "non-empty string" }`. The DTO trims the comment and throws `ReviewCommentPayloadInvalidException` (33013) on missing / non-string payload, `ReviewCommentEmptyException` (33011) on empty-after-trim, or `ReviewCommentTooLongException` (33012) past 5000 chars. Creates a `ReviewComment` on the version (author = current user) **and** transitions `reviewVersion.status` to `ChangesRequested` in one flush. Allowed from `Pending` or `Approved` — otherwise 409 `ReviewVersionNotPendingOrApprovedException` (33009). 409 `ReviewVersionNotLatestException` (33010) if the version is no longer the latest. Returns the parent draft serialized with `api_review_versions_request_changes`. |
| `POST /api/review-comments` | `User` (auth only) | `PROJECT_VIEW` on the version's draft's project | Lives in **`ReviewCommentController`** (separate from `ReviewVersionController` because the comment is its own entity). The route follows the create convention used elsewhere (e.g. `POST /api/reviews`): a flat resource URL with the parent identifier carried in the JSON body. Body: `{ "reviewVersionUuid": UUID, "body": "non-empty string", "parentCommentUuid"?: UUID, "videoTimecodeSeconds"?: float >= 0 }`. Validation is declarative on the DTO (`#[Assert\NotBlank]`, `#[Assert\Length(max: 5000)]`, `#[Assert\Uuid]`, `#[Assert\Type('numeric')]`, `#[Assert\PositiveOrZero]`); the controller calls `$dto->build()` to obtain the pre-populated `ReviewComment` then attaches author, media version, and (when present) parent / timecode. **Open to both agency members and clients** — the comment thread is bidirectional: clients leave feedback when requesting changes, the agency replies in the same thread. Creates a `ReviewComment` (author = current user) on the version, **does not change status**. When `parentCommentUuid` is set, the new comment is a reply (any depth); the controller checks the parent exists and belongs to the same media version. Replies **cannot** carry a `videoTimecodeSeconds` — both together → 400 `ReviewCommentReplyCannotHaveTimecodeException` (33015). 404 `ReviewCommentParentNotFoundException` (33014) for unknown / cross-version parent UUID. 409 `ReviewVersionNotLatestException` (33010) if the version is no longer the latest. Returns the parent draft serialized with `api_review_comments_create`. |
| `PATCH /api/review-comments/{uuid}` | `User` (auth only) | `PROJECT_VIEW` on the comment's draft's project + per-field checks below | Partial update on an existing comment, presentFields-style DTO (matches `UpdateReviewRequestDTO`). Body: any subset of `{ "body"?: string, "status"?: "open"\|"resolved", "videoTimecodeSeconds"?: float\|null }`. Threading (`parentComment`) is immutable and never exposed by the endpoint. **Per-field permission rules:** `body` and `videoTimecodeSeconds` are editable only by the comment **author** — otherwise 403 `ReviewCommentEditForbiddenException` (33019). `status` is editable only by **agency editors** (additional `PROJECT_EDIT` check). `status` and `videoTimecodeSeconds` mutations on a reply both 409 (`ReviewCommentStatusOnReplyForbiddenException` 33018, `ReviewCommentTimecodeOnReplyForbiddenException` 33020). `videoTimecodeSeconds: null` clears the pin; the value is otherwise validated as `>= 0`. Empty body → 400 `ReviewCommentEmptyException` (33011). Unknown `status` → 400 `ReviewCommentStatusInvalidException` (33017). 404 `ReviewCommentNotFoundException` (33016) if the UUID is unknown. Returns the parent draft serialized with `api_reviews_show`. |

### Response shape

All endpoints serialize the `Review` entity directly with `#[Groups]` — no Response DTOs. Two groups drive the shape:

- `api_reviews_list` (list endpoint) — exposes `uuid`, `title`, `mediaType`, `createdAt`, `updatedAt`, `script` (linked Script entity, also tagged with this group on `uuid` + `title`), and the virtual `latestVersion` getter (`Review::getLatestVersion()`) tagged with the list group. The latest version surfaces `uuid`, `fileCount`, `status`, `videoStreamingStatus`, `videoStreamingFailureReason`, `createdAt`. The full `versions` collection is **not** in this group.
- `api_reviews_show` (show / create / update) and its three action-specific siblings — `api_review_versions_approve`, `api_review_versions_request_changes`, `api_review_comments_create` — render the same shape: `description`, `notes`, and the full ordered `versions` collection. Each version additionally exposes its `comments` array (`uuid`, `body`, `status`, `videoTimecodeSeconds`, `createdAt`, `author.{uuid, firstName, lastName, email}`, plus the recursive `replies` array shaped the same way). The author payload reuses the existing `User` shape on the frontend. The action-specific groups follow the `api_{resource}_{action}` convention required by the coding style — each endpoint uses its own group name even when the field set is identical. The PATCH update endpoint reuses `api_reviews_show` directly (no dedicated group) since the rendered shape is identical.

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
| `ReviewVersionNotPendingOrApprovedException` | 409 | 9 | Request-changes called while the latest version is neither `Pending` nor `Approved`. |
| `ReviewVersionNotLatestException` | 409 | 10 | Approve / request-changes called against a media version that is no longer the latest one of its draft. |
| `ReviewCommentEmptyException` | 400 | 11 | Comment body is missing or empty after trim. |
| `ReviewCommentTooLongException` | 400 | 12 | Comment body exceeds the 5000-character limit. |
| `ReviewCommentPayloadInvalidException` | 400 | 13 | Comment payload is malformed (missing `comment` key or non-string value). |
| `ReviewCommentParentNotFoundException` | 404 | 14 | `parentCommentUuid` on create refers to an unknown comment, or one belonging to a different media version. |
| `ReviewCommentReplyCannotHaveTimecodeException` | 400 | 15 | Create payload sets both `parentCommentUuid` and `videoTimecodeSeconds`. |
| `ReviewCommentNotFoundException` | 404 | 16 | PATCH `{uuid}` does not match a stored comment. |
| `ReviewCommentStatusInvalidException` | 400 | 17 | PATCH body sets `status` to a value not in `ReviewCommentStatus`. |
| `ReviewCommentStatusOnReplyForbiddenException` | 409 | 18 | PATCH tries to mutate `status` on a reply (top-level only). |
| `ReviewCommentEditForbiddenException` | 403 | 19 | A user other than the comment author tries to PATCH `body` or `videoTimecodeSeconds`. |
| `ReviewCommentTimecodeOnReplyForbiddenException` | 409 | 20 | PATCH tries to mutate `videoTimecodeSeconds` on a reply (top-level only). |

All exceptions extend `ReviewException` → `DomainCode::Review` (33). Full codes are `33001`–`33020`. **Convention:** each distinct error condition gets its own exception with a fixed code — we do **not** multiplex multiple reasons through a single exception with a `reason` enum in meta.

## Async video streaming

Video uploads get a second pass after the synchronous `POST /api/reviews` succeeds:

1. `ReviewController::create` sets `videoStreamingStatus = pending` on the new `ReviewVersion`, flushes, then dispatches `ProcessReviewVideoMessage($reviewVersion->getId())` on the `messages` transport (the existing single RabbitMQ-backed transport — see [rabbitmq-messenger-feature.md](rabbitmq-messenger-feature.md)).
2. `ProcessReviewVideoHandler` loads the entity, flips status to `processing`, then calls `ReviewVideoStreamingService::generateHls()`.
3. `ReviewVideoStreamingService` shells out to `ffmpeg` (via `Symfony\Component\Process\Process`) with a single command that writes three HLS renditions and the master playlist into the media version's `stream/` subdirectory in one pass:

   | Variant | Height | Video bitrate | Audio bitrate |
   |---|---|---|---|
   | `1080p` | 1080 | 5000 kbps | 128 kbps |
   | `720p`  | 720  | 2800 kbps | 128 kbps |
   | `480p`  | 480  | 1400 kbps | 96 kbps  |

   All variants are always generated regardless of source resolution (deliberate — keeps the player ladder predictable). Segments are 4 s VOD. Audio mapping is optional (`0:a:0?`) so videos without an audio track still produce valid output.
4. After ffmpeg returns, the service asserts `master.m3u8` and every per-variant `index.m3u8` exist, then `unlink()`s the original `1.{ext}` source file.
5. Handler flips status to `ready` and flushes.

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
| `ready` | Use HLS: `GET /api/review-versions/stream?reviewVersionUuid=&path=master.m3u8` (hls.js on Chromium/Firefox, native on Safari/iOS) |
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

## Out of scope (next phases)

- Phase 3: agency feedback inbox + re-upload that creates a new `ReviewVersion` on the existing draft.
- Phase 4: `Post.review` backlink populated when the linked Script's `PostGroup` gets a published `Post`.
- Phase 5: optional subscription-tier gating for media version history.
