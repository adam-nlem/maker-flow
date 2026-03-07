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
| `limit` | int | No | 10 | Number of ranked groups to return |

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

### Matching Criteria

1. **Time window**: Candidates must be published within ±2 hours of the new post
2. **Caption similarity**: Uses PHP's `similar_text()` with an 80% similarity threshold
3. **Cross-integration**: Only matches posts from different integrations (same project)

### Auto-Grouping Flow

1. New post is created in `PostService::createOrGetPost()` or `createOrGetYoutubePost()`
2. `PostGroupService::tryAutoGroup()` is called
3. Query candidates: posts in the same project, different integration, within 2h window
4. For each candidate, check caption similarity (≥80%)
5. On first match:
   - If the matched post already has a PostGroup → add the new post to that group
   - If no group exists → create a new PostGroup (title = caption) and add both posts
6. If no match → do nothing (post remains ungrouped)

## Files

| File | Purpose |
|------|---------|
| `src/Entity/PostGroup.php` | Entity with serialization groups |
| `src/Entity/Post.php` | Post entity (postGroup relationship) |
| `src/Controller/PostGroupController.php` | 4 CRUD endpoints + rank endpoint |
| `src/Service/PostGroup/PostGroupService.php` | Auto-grouping logic + ranked post groups |
| `src/Service/Post/PostService.php` | Calls auto-grouping after post creation |
| `src/Repository/PostGroupRepository.php` | getByProjectAndUser, getRankedIdsByProjectAndUserSortedByInsightValue, getByIdsWithPosts |
| `src/Repository/PostInsightRepository.php` | getAggregatedLatestByPostGroupIds |
| `src/Repository/PostRepository.php` | getByProjectAndPublishedAtWindow |
| `src/DTO/QueryParam/PostGroup/ListPostGroupsQueryParamDTO.php` | List query params |
| `src/DTO/QueryParam/PostGroup/RankPostGroupsQueryParamDTO.php` | Rank query params |
| `src/DTO/Response/PostGroup/PostGroupWithAggregatedInsightsResponseDTO.php` | Rank response DTO |
| `src/DTO/Request/PostGroup/CreatePostGroupRequestDTO.php` | Create request |
| `src/DTO/Request/PostGroup/UpdatePostGroupRequestDTO.php` | Update request |
