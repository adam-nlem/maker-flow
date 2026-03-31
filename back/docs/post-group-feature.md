# Post Group Feature

## Overview

Post Groups allow grouping posts together, either manually via API or automatically when the same content is published across multiple platforms (e.g., Instagram + YouTube).

## Entity

### PostGroup

- **uuid** (GUID): Unique identifier
- **title** (string): Group name
- **user** (ManyToOne → User): Owner, CASCADE delete
- **project** (ManyToOne → Project): Project scope, CASCADE delete
- **posts** (OneToMany → Post): Posts in this group (no cascade delete — deleting a group unlinks posts)
- **script** (OneToOne → Script): Optional linked script
- **createdAt** / **updatedAt**: Timestamps

### Post ↔ PostGroup Relationship

- `Post.postGroup` is nullable ManyToOne with `onDelete: SET NULL`
- Deleting a PostGroup sets `postGroup = null` on all its posts (posts are NOT deleted)

## Serialization Groups

- `api_post_groups_list` — list endpoint (includes nested posts with uuid, externalId, mediaType, caption, publishedAt, externalUrl, duration)
- `api_post_groups_create` — create endpoint (uuid, title, createdAt, updatedAt)
- `api_post_groups_update` — update endpoint (uuid, title, createdAt, updatedAt)
- `api_post_groups_rank` — rank endpoint (uuid, title, createdAt, updatedAt — no nested posts)

## API Endpoints

Base route: `/api/post-groups`

### List Post Groups

```
GET /api/post-groups?projectUuid={projectUuid}
```

Returns all post groups for the given project, ordered by `createdAt DESC`, with nested posts.

### Create Post Group

```
POST /api/post-groups
{
    "projectUuid": "uuid",
    "title": "My Group",
    "postUuids": ["post-uuid-1", "post-uuid-2"]
}
```

Creates a new group and links the specified posts to it. `postUuids` is optional (defaults to empty array).

### Update Post Group

```
PATCH /api/post-groups/{postGroupUuid}
{
    "title": "New Title",
    "addPostUuids": ["post-uuid-3"],
    "removePostUuids": ["post-uuid-1"]
}
```

All fields are optional. Updates title, adds posts, and/or removes posts from the group.

### Rank Post Groups

```
GET /api/post-groups/rank?projectUuid={projectUuid}&limit=10
```

Returns the top N post groups for a project, sorted by total views (sum of latest view insights across all posts in each group).

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectUuid` | string (UUID) | Yes | — | UUID of the project |
| `page` | int | No | 1 | Page number (1-indexed) |
| `limit` | int | No | 10 | Number of ranked groups per page |

**Response:** `PostGroupWithAggregatedInsightsResponseDTO[]`

```json
[
  {
    "postGroup": {
      "uuid": "...",
      "title": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "posts": [
        { "uuid": "...", "externalId": "...", "mediaType": "video", "caption": "...", "publishedAt": "...", "externalUrl": "...", "duration": 0 }
      ]
    },
    "aggregatedInsights": [
      { "type": "views", "value": 15000 },
      { "type": "likes", "value": 800 }
    ]
  }
]
```

Aggregated insights sum the latest value per type across all posts in the group. Posts are nested inside `postGroup` via the `api_post_groups_rank` serialization group.

### Delete Post Group

```
DELETE /api/post-groups/{postGroupUuid}
```

Unlinks all posts from the group, then deletes the group. Posts are preserved.

## Auto-Grouping

When a new post is created (via Instagram or YouTube insight fetch), the system automatically attempts to group it with matching posts from other integrations in the same project.

### Multi-Signal Scoring Algorithm

Auto-grouping uses a weighted composite score from 4 signals. When a signal is unavailable (no caption, no thumbnail, both duration=0), its weight redistributes proportionally to the remaining signals.

**Minimum requirements:** At least 2 signals must be available for auto-grouping to attempt a match.

#### Signals

| Signal | Weight | Availability | Details |
|--------|--------|-------------|---------|
| Caption similarity | 0.40 | Both posts have non-empty captions | Captions are normalized (strip hashtags/mentions, collapse whitespace, lowercase). Two-pronged matching: containment check (YT title inside IG caption body = 0.85 score) + `similar_text()` percentage. Takes the maximum. |
| Duration proximity | 0.30 | Both posts have duration > 0 | Stepped scoring: ≤2s diff = 1.0, ≤5s = 0.8, ≤10s = 0.5, >10s = 0.0. Instagram posts always have duration=0, so this only applies to YouTube-to-YouTube comparisons. |
| Thumbnail similarity | 0.15 | Both posts have a thumbnail file on disk | Uses GD-based Average Hash (aHash): resize to 8x8 grayscale, compute 64-bit hash from average brightness. Score = 1.0 - (hammingDistance / 64). Handles different video frames reasonably when they share similar color/brightness patterns. |
| Time proximity | 0.15 | Always available | Continuous decay: `max(0, 1.0 - diffHours / 2)`. Posts 0h apart = 1.0, 1h = 0.5, 2h = 0.0. |

**Composite score threshold:** ≥ 0.65 to auto-group.

**Best-match strategy:** All candidates are scored and the highest-scoring one above the threshold is selected (not the first match).

### Caption Normalization

Handled by `CaptionHelper::normalize()`:
1. Strip hashtags (`#word`)
2. Strip mentions (`@word`)
3. Collapse whitespace (newlines, multiple spaces → single space)
4. Trim and lowercase

### Thumbnail Comparison

Handled by `ThumbnailHashHelper`:
- Uses PHP GD extension (no external library)
- Average Hash (aHash) algorithm on 8x8 downscaled images
- Tolerates different video frames when they share similar visual characteristics
- Falls back gracefully when thumbnails are missing (signal becomes unavailable)

### Auto-Grouping Flow

1. New post is created in `PostService::createOrGetPost()` or `createOrGetYoutubePost()`
2. `PostGroupService::tryAutoGroup()` is called
3. Guard: skip if post already has a group
4. Query candidates: posts in the same project, different integration, within ±2h window
5. Score each candidate using the multi-signal composite score
6. Pick the best candidate with score ≥ 0.65
7. On match:
   - If the matched post already has a PostGroup → add the new post to that group
   - If no group exists → create a new PostGroup and add both posts
8. Group title: uses the incoming post's caption, falling back to the candidate's caption, falling back to a date-based title ("Post group - YYYY-MM-DD")
9. If no match above threshold → do nothing (post remains ungrouped)

### Retroactive Auto-Grouping Command

```bash
dce back php bin/console app:post-group:auto-group
```

Re-runs auto-grouping on all ungrouped posts (where `postGroup IS NULL`), ordered by `publishedAt ASC`. Useful after algorithm improvements to retroactively group posts missed by the previous logic.

## Files

| File | Purpose |
|------|---------|
| `src/Entity/PostGroup.php` | Entity with serialization groups |
| `src/Entity/Post.php` | Post entity (postGroup relationship) |
| `src/Controller/PostGroupController.php` | 4 CRUD endpoints + rank endpoint |
| `src/Service/PostGroup/PostGroupService.php` | Multi-signal auto-grouping logic + ranked post groups |
| `src/Service/Post/PostService.php` | Calls auto-grouping after post creation |
| `src/Service/Post/PostThumbnailService.php` | Thumbnail file operations (download, resolve path, get file) |
| `src/DTO/AutoGroupSignal.php` | Typed signal DTO for composite score computation |
| `src/Helper/CaptionHelper.php` | Caption normalization and cross-platform similarity |
| `src/Helper/ThumbnailHashHelper.php` | GD-based average hash (aHash) image comparison |
| `src/Command/AutoGroupPostsCommand.php` | CLI command for retroactive auto-grouping |
| `src/Repository/PostGroupRepository.php` | getByProjectAndUser, getRankedIdsByProjectAndUserSortedByInsightValue, getByIdsWithPosts |
| `src/Repository/PostInsightRepository.php` | getAggregatedLatestByPostGroupIds |
| `src/Repository/PostRepository.php` | getByProjectAndPublishedAtWindow, getUngroupedPosts |
| `src/DTO/QueryParam/PostGroup/ListPostGroupsQueryParamDTO.php` | List query params |
| `src/DTO/QueryParam/PostGroup/RankPostGroupsQueryParamDTO.php` | Rank query params |
| `src/DTO/Response/PostGroup/PostGroupWithAggregatedInsightsResponseDTO.php` | Rank response DTO |
| `src/DTO/Request/PostGroup/CreatePostGroupRequestDTO.php` | Create request |
| `src/DTO/Request/PostGroup/UpdatePostGroupRequestDTO.php` | Update request |
