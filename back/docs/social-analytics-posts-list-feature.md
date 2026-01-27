# Social Analytics Posts List Feature

## Overview

This feature provides a paginated endpoint to list all posts for an integration with their insights and evolution percentages.

---

## Endpoint

**GET** `/api/modules/social-analytics/posts`

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `integrationUuid` | string | Yes | - | UUID of the integration to fetch posts for |
| `page` | int | Yes | - | Page number (1-indexed) |
| `limit` | int | Yes | - | Number of posts per page |
| `timePeriod` | string | No | `last_7_days` | Time period for insights (`last_7_days`, `last_30_days`, `last_90_days`, `last_year`) |

### Response

Returns an array of posts with their insights and evolution data:

```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "externalId": "17895695668004550",
    "mediaType": "video",
    "publishedAt": "2026-01-20T10:00:00+00:00",
    "caption": "Check out this amazing content!",
    "insights": [
      {
        "type": "reach",
        "value": 1500,
        "evolutionPercentage": 12.5
      },
      {
        "type": "likes",
        "value": 200,
        "evolutionPercentage": -5.2
      },
      {
        "type": "comments",
        "value": 45,
        "evolutionPercentage": null
      }
    ]
  }
]
```

### Evolution Calculation

Evolution percentage is calculated by comparing the current period's latest insight value with the previous period's latest value:

- **Current Period**: From `now - timePeriod` to `now`
- **Previous Period**: From `now - (2 * timePeriod)` to `now - timePeriod`

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
src/Module/SocialAnalytics/
├── Controller/
│   └── SocialAnalyticsPostController.php          # list() endpoint
├── DTO/
│   ├── QueryParam/
│   │   └── Post/
│   │       └── ListSocialAnalyticsPostsQueryParamDTO.php
│   └── Response/
│       └── SocialAnalyticsPost/
│           ├── SocialAnalyticsPostInsightWithEvolutionDTO.php
│           └── SocialAnalyticsPostWithInsightsDTO.php
├── Helper/
│   └── InsightEvolutionHelper.php                 # Shared evolution calculation logic
├── Repository/
│   ├── SocialAnalyticsPostRepository.php          # getByUserAndIntegrationPaginated()
│   └── SocialAnalyticsPostInsightRepository.php   # getLatestByPostsAndTimePeriod()
└── Service/
    └── SocialAnalyticsPostService.php             # getPostsWithInsights()
```

---

## Usage


---

## Notes

- Posts are sorted by `publishedAt` DESC (most recent first)
- Only the latest insight value per type within the time period is returned
- The `InsightEvolutionHelper` is shared with `SocialAnalyticsIntegrationDetailService` to avoid code duplication
