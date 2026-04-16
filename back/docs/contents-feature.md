# Contents Feature

## Overview

Backend changes to support the unified Contents page. This includes extending existing endpoints to return enriched DTOs, adding project-scoped post listing, and a new post search endpoint.

## Modified Endpoints

### List Posts (project-scoped)

```
GET /api/posts?projectUuid={projectUuid}&platform={platform}&page=1&limit=20
```

Now accepts `projectUuid` + optional `platform` as an alternative to `integrationUuid`. This enables project-scoped post listing with optional platform filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectUuid` | string (UUID) | Yes (alternative to `integrationUuid`) | UUID of the project |
| `platform` | string | No | Platform filter (e.g., `instagram`, `youtube`) |
| `page` | int | No | Page number (default: 1) |
| `limit` | int | No | Items per page (default: 20) |

**Response:** `PostListItemResponseDTO[]`

Each item is a flat DTO with only the fields needed for list cards: `uuid`, `caption`, `publishedAt`, `platform`, `views`, `totalInteractions`, `engagementByViews`.

### Show Post

```
GET /api/posts/{postUuid}
```

Returns full post details with all aggregated insights, platform, post group info, and engagement rate.

**Response:** `PostWithPlatformAndInsightsResponseDTO`

```json
{
  "post": { "uuid": "...", "caption": "...", "publishedAt": "...", "externalUrl": "...", ... },
  "platform": "instagram",
  "aggregatedInsights": [
    { "type": "views", "value": 25000 },
    { "type": "likes", "value": 1200 }
  ],
  "postGroupUuid": "...",
  "postGroupTitle": "...",
  "engagementByViews": 4.8
}
```

### List Post Groups (paginated)

```
GET /api/post-groups?projectUuid={projectUuid}&page=1&limit=10
```

Returns paginated flat DTOs with only the fields needed for list cards.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectUuid` | string (UUID) | Yes | UUID of the project |
| `page` | int | Yes | Page number |
| `limit` | int | Yes | Items per page |

**Response:** `PostGroupListItemResponseDTO[]`

Each item is a flat DTO: `uuid`, `title`, `createdAt`, `postCount`, `views`, `totalInteractions`, `engagementByViews`, `scriptTitle`.

### Show Post Group

```
GET /api/post-groups/{postGroupUuid}
```

Returns full post group details with all aggregated insights, linked posts, and linked script.

**Response:** `PostGroupWithInsightsAndScriptResponseDTO`

```json
{
  "postGroup": { "uuid": "...", "title": "...", "posts": [...] },
  "aggregatedInsights": [
    { "type": "views", "value": 25000 },
    { "type": "likes", "value": 1200 }
  ],
  "script": { "uuid": "...", "title": "..." },
  "engagementByViews": 4.8
}
```

### Update Post Group (script linking)

```
PATCH /api/post-groups/{uuid}
{
    "title": "New Title",
    "addPostUuids": ["..."],
    "removePostUuids": ["..."],
    "scriptUuid": "script-uuid"
}
```

Now supports the `scriptUuid` field. Set to a UUID to link a script, or `null` to unlink. The FK is on the Script side (OneToOne relationship: `Script.postGroup`).

## New Endpoints

### Search Posts

```
GET /api/posts/search?projectUuid={projectUuid}&query={query}
```

Searches posts by caption within a project. Used by the PostPicker component on the frontend.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectUuid` | string (UUID) | Yes | UUID of the project |
| `query` | string | Yes | Caption search string |

## New DTOs

| File | Purpose |
|------|---------|
| `src/DTO/Response/Post/PostListItemResponseDTO.php` | Flat summary DTO for the post list (uuid, caption, publishedAt, platform, views, totalInteractions, engagementByViews) |
| `src/DTO/Response/Post/PostWithPlatformAndInsightsResponseDTO.php` | Full post detail with platform and all aggregated insights (used by show endpoint) |
| `src/DTO/Response/PostGroup/PostGroupListItemResponseDTO.php` | Flat summary DTO for the group list (uuid, title, createdAt, postCount, views, totalInteractions, engagementByViews, scriptTitle) |
| `src/DTO/Response/PostGroup/PostGroupWithInsightsAndScriptResponseDTO.php` | Full group detail with aggregated insights, posts, and linked script (used by show endpoint) |
| `src/DTO/QueryParam/Post/SearchPostsQueryParamDTO.php` | Query params for the search endpoint |

## New Repository Methods

| Method | File | Description |
|--------|------|-------------|
| `getByProjectAndUserPaginated()` | `src/Repository/PostRepository.php` | Paginated posts filtered by project, user, and optional platform |
| `getByProjectAndUserPaginated()` | `src/Repository/PostGroupRepository.php` | Paginated post groups filtered by project and user |
| `searchByProjectAndUserAndCaption()` | `src/Repository/PostRepository.php` | Caption-based search within a project |

## New Service Methods

| Method | File | Description |
|--------|------|-------------|
| `getPostListItems()` | `src/Service/Post/PostService.php` | Fetches paginated flat post summaries for the list |
| `getPostDetail()` | `src/Service/Post/PostService.php` | Fetches full post detail with all aggregated insights for a single post |
| `getPostGroupListItems()` | `src/Service/PostGroup/PostGroupService.php` | Fetches paginated flat group summaries for the list |
| `getPostGroupDetail()` | `src/Service/PostGroup/PostGroupService.php` | Fetches full group detail with all aggregated insights, posts, and script |

## Post Group Insight Aggregation

When aggregating insights across posts in a post group, the aggregation strategy depends on the metric type:

- **Cumulative metrics** (views, likes, comments, shares, etc.) are **summed** across posts
- **Rate/average metrics** (`AverageWatchTime`, `ThumbnailImpressionsClickRate`, `AudienceWatchRatio`) are **averaged** across posts

This is controlled by `PostInsightType::shouldAverage()`. The repository method `getAggregatedLatestByPostGroupIds()` fetches both `SUM` and `COUNT`, then divides by count for averaged types.

## Script Linking

Scripts are linked to post groups via a OneToOne relationship where the FK lives on the `Script` entity (`Script.postGroup`). The `PATCH /api/post-groups/{uuid}` endpoint handles linking/unlinking:

- **Link:** send `"scriptUuid": "uuid"` — sets `script.postGroup` to the target post group
- **Unlink:** send `"scriptUuid": null` — sets `script.postGroup` to null

This design keeps the PostGroup entity clean and leverages the existing Script ↔ PostGroup OneToOne defined in the script feature.
