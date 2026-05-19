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
                    ├── 1.{ext}
                    ├── 2.{ext}
                    └── …
```

- Filenames are **1-based integers** in the order they arrived in the multipart request. Carousel ordering is the integer in the filename — no DB row, no JSON, no index column.
- Files are stored as-is with their original extension; nothing is transcoded server-side.
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
| `GET /api/post-draft-media-versions/{mediaVersionUuid}/files/{index}` | `Viewer` | `PROJECT_VIEW` on the media version's draft's project | Lives in **`PostDraftMediaVersionController`** (separate from `PostDraftController`). Streams a single stored file (`BinaryFileResponse`, `DISPOSITION_INLINE`). Range requests handled automatically. Returns 404 when the index is out of range or the file is missing on disk. |

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
| `MissingPostDraftException` | 404 | 2 | Draft UUID not found, or `streamFile` couldn't locate the requested file on disk |
| `ScriptAlreadyHasPostDraftException` | 409 | 3 | Unique constraint on `post_draft.script_id` violated. On create, the on-disk media version directory is wiped before the exception is rethrown. |
| `PostDraftLockedException` | 409 | 4 | Update attempted while status ≠ `AwaitingReview` |
| `UnresolvableMediaVersionAgencyException` | 500 | 5 | A `PostDraftMediaVersion` cannot resolve its owning agency through the `postDraft → project → agency` chain (data-integrity failure). |

All exceptions extend `PostDraftException` → `DomainCode::PostDraft` (33). Full codes are `33001`–`33005`.

## Infra

- PHP upload limits are bumped via `back/.docker/build/php-uploads.ini` (`upload_max_filesize = 512M`, `post_max_size = 512M`, `memory_limit = 1024M`, `max_execution_time = 600`).

## Migration

`back/migrations/Version20260514120000.php` — creates `post_draft` and `post_draft_media_version`, the unique index on `post_draft.script_id`, and the supporting indexes `(project_id, status)` and `(post_draft_id, created_at)`. No optimization column — files are stored as-is.

## Out of scope (next phases)

- Phase 2: client `/client/drafts` (or equivalent) — approve / changes-requested actions, comments tied to a media version.
- Phase 3: agency feedback inbox + re-upload that creates a new `PostDraftMediaVersion` on the existing draft.
- Phase 4: `Post.postDraft` backlink populated when the linked Script's `PostGroup` gets a published `Post`.
- Phase 5: optional subscription-tier gating for media version history.
