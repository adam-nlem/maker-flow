# Post Draft Feature (Backend)

## Overview

Agency-side workflow for uploading content (video, single image, image carousel) and tracking client review status. Sits between `Script` (planning) and `Post` (published on a platform):

```
Script (1‑1) PostDraft (1‑N) PostDraftMediaVersion
                  |
                  | Phase 4 backlink (not in Phase 1)
                  v
              Post (N‑1) PostDraft
```

A `PostDraftMediaVersion` models **one upload iteration of media files** for a draft: each upload action creates a new row and files are stored on disk indexed `1..N` with their original extensions.

Phase 1 ships only the agency-side surface: create, list, show, update, delete. Client-side review actions (approve / request changes) land in Phase 2.

## Entities

### `PostDraft` (`src/Entity/PostDraft.php`)

| Field | Type | Notes |
|---|---|---|
| `uuid` | GUID | Public identifier |
| `title` | string(255) | Required |
| `description` | text, nullable | Future social caption |
| `notes` | text, nullable | Agency → client context |
| `mediaType` | `App\Entity\Enum\MediaType` | Reused from `Post.mediaType` (`Video`/`Image`/`Carousel`) |
| `status` | `App\Entity\Enum\PostDraftStatus` | Default `AwaitingReview`. Other cases (`ChangesRequested`, `Approved`, `Rejected`) declared but unused in Phase 1 |
| `project` | ManyToOne `Project` | NOT NULL, cascade delete |
| `script` | OneToOne `Script` | Nullable, `SET NULL` on script delete, **DB unique constraint** — at most one draft per script |
| `createdBy` | ManyToOne `User` | Nullable, `SET NULL` |
| `mediaVersions` | OneToMany `PostDraftMediaVersion` | Cascade remove, orphan removal, ordered by `createdAt ASC` |
| `createdAt` / `updatedAt` | DateTimeImmutable | Lifecycle callbacks |

### `PostDraftMediaVersion` (`src/Entity/PostDraftMediaVersion.php`)

| Field | Type | Notes |
|---|---|---|
| `uuid` | GUID | Public identifier — used in stream URL |
| `postDraft` | ManyToOne (`inversedBy: 'mediaVersions'`) | NOT NULL, cascade delete |
| `fileCount` | smallint | Set at upload time, lets the API expose carousel size without scanning disk |
| `videoStreamingStatus` | `App\Entity\Enum\VideoStreamingStatus`, nullable | `pending`/`processing`/`ready`/`failed`. Set to `pending` on create when `mediaType === Video`. Stays `null` for image / carousel media versions and for legacy pre-2026-05-19 rows. |
| `videoStreamingFailureReason` | `App\Entity\Enum\VideoStreamingFailureReason`, nullable | Populated by `PostDraftVideoProcessingFailedSubscriber` when status flips to `failed`. Values: `invalid_source`, `processing_error`. |
| `createdAt` | DateTimeImmutable | |

No `MediaFile` entity. Files live on disk only — see [Storage layout](#storage-layout).

## Storage layout

All agency-owned uploads share a single root, scoped by `agencyUuid`:

```
private/uploads/agency/
  └── {agencyUuid}/
        ├── logo/
        │     └── {agencyUuid}.png
        └── post-drafts/
              └── {mediaVersionUuid}/
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
- Both `AgencyLogoService` and `PostDraftFileService` are wired with the same container parameter `app.uploads.agency_root` (`%kernel.project_dir%/private/uploads/agency`) and derive their per-agency sub-paths from it. The post-draft service walks `mediaVersion → postDraft → project → agency` to resolve the agency UUID at runtime.
- **Breaking change (2026-05-14):** agency logos previously lived at `private/uploads/agency/logo/{agencyUuid}.png`. They now sit under the agency-rooted layout above. Pre-existing files need to be re-uploaded or moved manually.

## API endpoints

Base path: `/api/post-drafts`. All routes require an authenticated user. Object-level checks via `ProjectVoter`.

| Method + path | Role gate | Voter | Purpose |
|---|---|---|---|
| `GET /api/post-drafts?projectUuid=&page=&limit=&status=&searchTerm=` | `Viewer` | `PROJECT_VIEW` on the project | Paginated list, focused project. Optional `status` (one of `awaiting_review`, `changes_requested`, `approved`, `rejected`) and `searchTerm` (case-insensitive `LIKE %term%` on `title`) narrow the result set. Empty / unknown values are ignored. |
| `GET /api/post-drafts/{uuid}` | `Viewer` | `PROJECT_VIEW` on the draft's project | Detail (includes `mediaVersions` array) |
| `POST /api/post-drafts` | `Editor` | `PROJECT_EDIT` | **Multipart**. Form fields: `projectUuid`, `title`, `mediaType` (`video`/`image`/`carousel`), optional `description`, `notes`, `scriptUuid`. Files in `files[]` (1 for video/image, 2–10 for carousel). |
| `PATCH /api/post-drafts/{uuid}` | `Editor` | `PROJECT_EDIT` | JSON. Updatable fields: `title`, `description`, `notes`, `scriptUuid` (any can be set to `null`). Allowed only when status is `AwaitingReview`. |
| `DELETE /api/post-drafts/{uuid}` | `Editor` | `PROJECT_EDIT` | Returns `200` + `{"message": "Post draft deleted successfully"}`. Doctrine cascade removes media versions; a `PostDraftMediaVersionDiskCleanupListener` (`preRemove`) handles on-disk cleanup automatically. |
| `GET /api/post-draft-media-versions/files?mediaVersionUuid=&index=` | `Viewer` | `PROJECT_VIEW` on the media version's draft's project | Lives in **`PostDraftMediaVersionController`** (separate from `PostDraftController`). Both params travel via the query string (`StreamFileQueryParamDTO`: `mediaVersionUuid` UUID + `index` positive int). Streams the corresponding stored file — extension globbed at runtime. Returns `BinaryFileResponse` with `DISPOSITION_INLINE`; range requests handled automatically. Used for image / carousel files and (pre-transcode) the original video. Returns 404 when the index is out of range or the file is missing on disk. For videos with `videoStreamingStatus === ready` this endpoint 404s — the original has been deleted; use the `/stream` endpoint instead. |
| `GET /api/post-draft-media-versions/stream?mediaVersionUuid=&path=` | `Viewer` | `PROJECT_VIEW` on the media version's draft's project | `mediaVersionUuid` + `path` via query string (`StreamHlsQueryParamDTO`). Serves any HLS artifact (master playlist, variant playlist, `.ts` segment) under the media version's `stream/` directory. Only `.m3u8` and `.ts` are accepted — anything else 404s. `realpath`-based path-traversal guard. `Content-Type` is set explicitly (`application/vnd.apple.mpegurl` / `video/mp2t`). |

### Response shape

All endpoints serialize the `PostDraft` entity directly with `#[Groups]` — no Response DTOs. Two groups drive the shape:

- `api_post_drafts_list` (list endpoint) — exposes `uuid`, `title`, `mediaType`, `status`, `createdAt`, `updatedAt`, `script` (linked Script entity, also tagged with this group on `uuid` + `title`), and the virtual `latestMediaVersion` getter (`PostDraft::getLatestMediaVersion()`) tagged with the list group. The full `mediaVersions` collection is **not** in this group.
- `api_post_drafts_show` (show / create / update) — adds `description`, `notes`, and the full ordered `mediaVersions` collection.

There is **no `PostDraftService`** — the controller composes the create / update / delete flows itself (DTO → repositories → file service → flush), matching the pattern used in `UserController::register`, `AgencyController::uploadLogo`, etc.

### Cascade delete + disk cleanup

Full Doctrine ORM cascade chain: `Project → PostDraft → PostDraftMediaVersion`, all with `cascade: ['remove']` + `orphanRemoval: true`. DB-level `ON DELETE CASCADE` on the FKs is the belt-and-suspenders fallback for raw-SQL deletes.

- Deleting a `PostDraft` via the controller (`$postDraftRepository->remove($postDraft, true)`) iterates `mediaVersions` via the ORM cascade and fires `preRemove` on each `PostDraftMediaVersion`.
- Deleting a `Project` via `ProjectController::delete` (`$projectRepository->remove($project, true)`) iterates `postDrafts` via the ORM cascade, which in turn iterates each draft's `mediaVersions` — the same `preRemove` fires.

The **`PostDraftMediaVersionDiskCleanupListener`** entity listener (wired in `config/services.yaml`) catches `preRemove` on `PostDraftMediaVersion` and calls `PostDraftFileService::deleteMediaVersion($mediaVersion)` to wipe the on-disk directory. Whether the trigger is a draft delete or a project delete, the disk gets cleaned up.

### Upload constraints (enforced by `PostDraftFileService`)

| Media type | File count | MIME types | Max size per file |
|---|---|---|---|
| Video | exactly 1 | `video/mp4`, `video/quicktime`, `video/webm` | 500 MB |
| Image | exactly 1 | `image/png`, `image/jpeg`, `image/webp` | 20 MB |
| Carousel | 2–10 | `image/png`, `image/jpeg`, `image/webp` | 20 MB each |

Violations throw `PostDraftFileInvalidException` (HTTP 400) carrying a `FileInvalidReason` enum value in `meta.reason` (one of `file_too_large`, `invalid_mime_type`, `too_many_files`, `too_few_files`, `missing_file`, `invalid_payload`). `FileInvalidReason` is the shared enum used by every file-upload validation exception across the app.

### Other typed errors

| Exception | HTTP | Code suffix | Trigger |
|---|---|---|---|
| `MissingPostDraftException` | 404 | 2 | Draft UUID not found, or `streamFile`/`streamHls` couldn't locate the requested file on disk |
| `ScriptAlreadyHasPostDraftException` | 409 | 3 | Unique constraint on `post_draft.script_id` violated. On create, the on-disk media version directory is wiped before the exception is rethrown. |
| `PostDraftLockedException` | 409 | 4 | Update attempted while status ≠ `AwaitingReview` |
| `UnresolvableMediaVersionAgencyException` | 500 | 5 | A `PostDraftMediaVersion` cannot resolve its owning agency through the `postDraft → project → agency` chain (data-integrity failure). |
| `VideoSourceNotFoundException` | 500 | 6 | The HLS worker started processing but the source `1.{ext}` is missing on disk. Surfaces `videoStreamingFailureReason = invalid_source` once retries exhaust. |
| `VideoProcessingFailedException` | 500 | 7 | ffmpeg exited non-zero, an expected HLS artifact is missing, or the original file could not be removed. Surfaces `videoStreamingFailureReason = processing_error`. |

All exceptions extend `PostDraftException` → `DomainCode::PostDraft` (33). Full codes are `33001`–`33007`.

## Async video streaming

Video uploads get a second pass after the synchronous `POST /api/post-drafts` succeeds:

1. `PostDraftController::create` sets `videoStreamingStatus = pending` on the new `PostDraftMediaVersion`, flushes, then dispatches `ProcessPostDraftVideoMessage($mediaVersion->getId())` on the `messages` transport (the existing single RabbitMQ-backed transport — see [rabbitmq-messenger-feature.md](rabbitmq-messenger-feature.md)).
2. `ProcessPostDraftVideoHandler` loads the entity, flips status to `processing`, then calls `PostDraftVideoStreamingService::generateHls()`.
3. `PostDraftVideoStreamingService` shells out to `ffmpeg` (via `Symfony\Component\Process\Process`) with a single command that writes three HLS renditions and the master playlist into the media version's `stream/` subdirectory in one pass:

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

If the same `mediaVersionId` is processed twice (e.g. a worker restart re-queues the message), the handler is a no-op when `videoStreamingStatus === ready`. Otherwise it wipes any partial `stream/` directory and starts fresh.

### Frontend consumption

`videoStreamingStatus` and `videoStreamingFailureReason` are exposed in both `api_post_drafts_list` and `api_post_drafts_show` groups. Recommended client behavior:

| Status | UI hint |
|---|---|
| `null` (image / carousel / legacy video) | Use `/files?mediaVersionUuid=&index=N` |
| `pending` / `processing` | Show "video is being prepared", optionally fall back to `/files?mediaVersionUuid=&index=1` for an immediate preview |
| `ready` | Use HLS: `GET /api/post-draft-media-versions/stream?mediaVersionUuid=&path=master.m3u8` (hls.js on Chromium/Firefox, native on Safari/iOS) |
| `failed` | Show failure UX based on `videoStreamingFailureReason`; the original is still available via `/files?mediaVersionUuid=&index=1` |

### Operational notes

- ffmpeg ships with both `back/.docker/build/Dockerfile` (dev) and `back/.docker/build/Dockerfile.prod` (runtime stage).
- No `php-ffmpeg/php-ffmpeg` composer dependency — the CLI binary is enough.
- `Process::setTimeout(null)` is intentional; the messenger worker's own `--time-limit` is the practical ceiling.

## Infra

- PHP upload limits are bumped via `back/.docker/build/php-uploads.ini` (`upload_max_filesize = 512M`, `post_max_size = 512M`, `memory_limit = 1024M`, `max_execution_time = 600`).

## Migration

- `back/migrations/Version20260514120000.php` — creates `post_draft` and `post_draft_media_version`, the unique index on `post_draft.script_id`, and the supporting indexes `(project_id, status)` and `(post_draft_id, created_at)`. No optimization column — files are stored as-is.
- `back/migrations/Version20260519120000.php` — adds nullable `video_streaming_status` and `video_streaming_failure_reason` (`VARCHAR(32)`) columns to `post_draft_media_version`. Existing rows stay `NULL` (treated as "legacy — use raw file" by the frontend); no backfill.

## Out of scope (next phases)

- Phase 2: client `/client/drafts` (or equivalent) — approve / changes-requested actions, comments tied to a media version.
- Phase 3: agency feedback inbox + re-upload that creates a new `PostDraftMediaVersion` on the existing draft.
- Phase 4: `Post.postDraft` backlink populated when the linked Script's `PostGroup` gets a published `Post`.
- Phase 5: optional subscription-tier gating for media version history.
