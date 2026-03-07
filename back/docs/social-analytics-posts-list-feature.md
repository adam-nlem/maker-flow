# Social Analytics Posts List Feature

## Overview

This feature provides endpoints to list posts for an integration with their insights and evolution percentages.

---

## Endpoints

### List Posts

**GET** `/api/posts`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integrationUuid` | string | Yes | UUID of the integration to fetch posts for |
| `page` | int | Yes | Page number (1-indexed) |
| `limit` | int | Yes | Number of posts per page |

> **Note:** The time period is hardcoded to `LastYear` in the controller. There is no `timePeriod` query parameter. This period is used to filter posts by `publishedAt` and to scope insight evolution calculations.

### Response

Returns an array of posts with their insights and evolution data:

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
    "insights": [
      {
        "insight": { "uuid": "...", "type": "reach", "value": 1500, "createdAt": "..." },
        "evolutionPercentage": 12.5
      },
      {
        "insight": { "uuid": "...", "type": "likes", "value": 200, "createdAt": "..." },
        "evolutionPercentage": -5.2
      },
      {
        "insight": { "uuid": "...", "type": "comments", "value": 45, "createdAt": "..." },
        "evolutionPercentage": null
      }
    ],
    "engagementByFollowers": 0.045,
    "engagementByReach": 0.12
  }
]
```

---

### Ranked Posts

**GET** `/api/posts/rank`

Returns the top N posts for an integration, sorted by views (descending). Uses a lightweight aggregated insights response (same pattern as `POST /api/post-groups/rank`).

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `integrationUuid` | string | Yes | — | UUID of the integration |
| `limit` | int | No | 10 | Number of ranked posts to return |

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

### Evolution Calculation

Evolution percentage is calculated by comparing the current period's latest insight value with the previous period's latest value:

- **Current Period**: From `now - 365 days` to `now` (hardcoded to `LastYear`)
- **Previous Period**: From `now - 730 days` to `now - 365 days`

Formula: `((currentValue - previousValue) / previousValue) * 100`

Returns `null` if:
- No previous value exists
- Previous value is 0

---

## Architecture

```
Controller
    └── Service (business logic)
        ├── PostRepository (paginated posts)
        └── PostInsightRepository (insights by time period)
            └── InsightEvolutionHelper (evolution calculation)
```

---

## Files

```
src/
├── Controller/
│   └── PostController.php          # list() and rank() endpoints
├── DTO/
│   ├── QueryParam/
│   │   └── Post/
│   │       ├── ListPostsQueryParamDTO.php
│   │       └── RankPostsQueryParamDTO.php
│   └── Response/
│       └── Post/
│           ├── PostInsightWithEvolutionDTO.php
│           ├── PostWithAggregatedInsightsResponseDTO.php
│           └── PostWithInsightsDTO.php
├── Helper/
│   └── InsightEvolutionHelper.php                 # Shared evolution calculation logic
├── Repository/
│   ├── PostRepository.php          # getByUserAndIntegrationAndPublishedAfterPaginated(), getRankedIdsByUserAndIntegrationSortedByInsightValue(), getByIds()
│   └── PostInsightRepository.php   # getLatestByPostsAndTimePeriod(), getAggregatedLatestByPostIds()
└── Service/
    └── PostService.php             # getPostsWithInsights(), getRankedPosts(), buildPostsWithInsightsDTOs()
```

---

## Usage


---

## Notes

- Posts are filtered by `publishedAt >= now - 365 days` (hardcoded `LastYear` period) and sorted by `publishedAt` DESC (most recent first)
- Only the latest insight value per type within the time period is returned
- The `InsightEvolutionHelper` and `InsightHelper` are shared with `IntegrationInsightService` and `PostInsightService` to avoid code duplication
