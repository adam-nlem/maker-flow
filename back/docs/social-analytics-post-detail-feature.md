# Social Analytics Post Detail Feature

## Overview

Provides a detail endpoint for a single post, returning insight stats with evolution percentages, engagement rates, and timeline data comparing the post's metrics over time against the average of the 10 previous posts.

## Endpoint

`GET /api/modules/social-analytics/post-insights/detail?postUuid={uuid}`

### Response

```json
{
    "uuid": "...",
    "externalId": "...",
    "mediaType": "video",
    "publishedAt": "2025-01-01T12:00:00+00:00",
    "caption": "...",
    "insights": [
        { "type": "views", "value": 1234, "evolutionPercentage": "+12.5%" }
    ],
    "engagementByFollowers": 5.2,
    "engagementByReach": 8.1,
    "timelines": [
        {
            "type": "views",
            "points": [
                { "hoursAfterPublication": 1.0, "value": 100, "averageValue": 85.3 }
            ]
        }
    ]
}
```

### Serialization Group

`api_modules_social_analytics_post_insights_detail`

## Architecture

### Service

`SocialAnalyticsPostInsightService::getDetail(User, SocialAnalyticsPost)`

The detail logic lives in `SocialAnalyticsPostInsightService` alongside the Instagram fetch logic.

**Algorithm** (4 DB queries, rest in-memory):
1. Get latest insight per type via `getLatestByPostGroupedByType` (DB-level dedup using `MAX(id) GROUP BY type`)
2. Compute insights with evolution using `InsightEvolutionHelper` (compare to previous post at same age)
3. Fetch timeline data for current post via `getByPostAndTypes` (DB-filtered to 6 timeline types)
4. Fetch 10 previous posts (`getPreviousByUserAndIntegration`)
5. Fetch timeline data for previous posts via `getByPostIdsAndTypes` (DB-filtered to 6 timeline types)
6. Build timelines for 6 types (Views, Likes, Comments, Shares, AverageWatchTime, TotalWatchTime):
   - For each insight of the current post, compute `hoursAfterPublication`
   - For each time offset, find the latest matching insight from each previous post and average them
7. Compute engagement rates (totalInteractions / followers, totalInteractions / reach)

### Repository Methods

**`SocialAnalyticsPostInsightRepository`:**
- `getLatestByPostGroupedByType(SocialAnalyticsPost)` — one insight per type (most recent), DB-level dedup
- `getByPostAndTypes(SocialAnalyticsPost, array)` — all insights for a post filtered by types, ordered by `createdAt ASC`
- `getByPostIdsAndTypes(array, array)` — all insights for multiple posts filtered by types, ordered by `createdAt ASC`
- `getLatestByPostGroupedByTypeBeforeDate(SocialAnalyticsPost, DateTimeImmutable, array)` — one insight per type (most recent before a date), DB-level dedup, for evolution comparison

**`SocialAnalyticsPostRepository`:**
- `getPreviousByUserAndIntegration(User, Integration, DateTimeImmutable, int)` — N posts published before a date
- `getSingleByIntegrationAndPublishedBeforeDate(Integration, DateTimeImmutable)` — single previous post for evolution

### DTOs

| DTO | Purpose |
|-----|---------|
| `ShowSocialAnalyticsPostInsightDetailResponseDTO` | Main response DTO |
| `SocialAnalyticsPostInsightTimelineDTO` | Timeline for one insight type |
| `SocialAnalyticsPostInsightTimelinePointDTO` | Single data point (hours, value, averageValue) |
| `ShowSocialAnalyticsPostInsightDetailQueryParamDTO` | Query parameter (`postUuid`) |

### Existing DTOs Modified

- `SocialAnalyticsPostInsightWithEvolutionDTO` — added `api_modules_social_analytics_post_insights_detail` to Groups attribute

### Shared Helpers

- `InsightHelper::getInsightValueByType` — extracts a single insight value by enum type from an array of insight entities
- `InsightHelper::calculateEngagement` — computes engagement rate as `(interactions / divisor) * 100`
- `InsightEvolutionHelper::buildPostInsightsWithEvolution` — sorts insights by a given type order and computes evolution percentages vs. previous insights
