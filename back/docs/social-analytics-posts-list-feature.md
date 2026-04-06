# Social Analytics Posts Rank Feature

## Overview

This feature provides the rank endpoint to list top posts for an integration, sorted by views.

---

## Endpoints

### Ranked Posts

**GET** `/api/posts/rank`

Returns the top N posts for an integration, sorted by views (descending). Uses a lightweight aggregated insights response (same pattern as `POST /api/post-groups/rank`).

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `integrationUuid` | string | Yes | — | UUID of the integration |
| `page` | int | No | 1 | Page number (1-indexed) |
| `limit` | int | No | 10 | Number of ranked posts per page |

#### Response

Returns `PostWithAggregatedInsightsResponseDTO[]`:

```json
[
  {
    "post": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "externalId": "17895695668004550",
      "mediaType": "video",
      "duration": 0,
      "publishedAt": "2026-01-20T10:00:00+00:00",
      "caption": "Check out this amazing content!",
      "externalUrl": "https://www.instagram.com/p/..."
    },
    "aggregatedInsights": [
      { "type": "views", "value": 15000 },
      { "type": "likes", "value": 200 },
      { "type": "comments", "value": 45 }
    ]
  }
]
```

---

## Files

```
src/
├── Controller/
│   └── PostController.php          # rank() endpoint
├── DTO/
│   ├── QueryParam/
│   │   └── Post/
│   │       └── RankPostsQueryParamDTO.php
│   └── Response/
│       └── Post/
│           └── PostWithAggregatedInsightsResponseDTO.php
├── Repository/
│   ├── PostRepository.php          # getRankedIdsByUserAndIntegrationSortedByInsightValue(), getByIds()
│   └── PostInsightRepository.php   # getAggregatedLatestByPostIds()
└── Service/
    └── PostService.php             # getRankedPosts()
```
