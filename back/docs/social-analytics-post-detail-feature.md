# Social Analytics Post Detail Feature

## Overview

Provides a detail endpoint for a single post, returning insight stats with evolution percentages, engagement rates, timeline data comparing the post's metrics over time against the average of the 10 previous posts, and a combined ranking of the current post against up to 9 previous posts.

### Gap Filling

The system stores insight data points but skips storage when the value is unchanged from the previous point (to save space). This creates gaps in the timeline data that are filled automatically using `TimelineGapFillerHelper`:

- **Hourly gaps** (`fillPostInsightTimelinePointsHourlyGaps`): For post timelines, missing hourly data points between existing points are filled by copying the value from the previous point.
- **Daily gaps** (`fillIntegrationInsightTimelinePointsDailyGaps`): For integration timelines, missing daily data points between existing points are filled by copying the value from the previous day.

## Endpoint

`GET /api/modules/social-analytics/post-insights/detail?postUuid={uuid}`

### Response

```json
{
    "post": {
        "uuid": "...",
        "externalId": "...",
        "mediaType": "video",
        "publishedAt": "2025-01-01T12:00:00+00:00",
        "caption": "...",
        "externalUrl": "https://www.instagram.com/p/...",
        "duration": 30
    },
    "insightsWithEvolution": [
        {
            "insight": { "uuid": "...", "type": "views", "value": 1234, "createdAt": "..." },
            "evolutionPercentage": "+12.5%"
        }
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
    ],
    "ranking": [
        {
            "post": { "uuid": "...", "externalId": "...", "mediaType": "video", "publishedAt": "...", "caption": "...", "externalUrl": "...", "duration": 30 },
            "score": 1523.45
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

**Algorithm** (5 DB queries, rest in-memory):
1. Get latest insight per type via `getLatestByPostGroupedByType` (DB-level dedup using `MAX(id) GROUP BY type`)
2. Compute insights with evolution using `InsightEvolutionHelper` (compare to previous post at same age)
3. Fetch timeline data for current post via `getByPostAndTypes` (DB-filtered to 6 timeline types)
4. Fetch 10 previous posts (`getByUserAndIntegrationAndPublishedBeforeLimited`)
5. Fetch timeline data for previous posts via `getByPostIdsAndTypes` (DB-filtered to 6 timeline types)
6. Build timelines for 6 types (Views, Likes, Comments, Shares, AverageWatchTime, TotalWatchTime):
   - For each insight of the current post, compute `hoursAfterPublication`
   - For each time offset, find the latest matching insight from each previous post and average them
7. Compute engagement rates (totalInteractions / followers, totalInteractions / reach)
8. Build ranking (current post + up to 9 previous posts):
   - Fetch latest insights per type per post via `getLatestByPostIdsGroupedByPostAndType` (1 DB query)
   - Calculate a combined score per post using weighted coefficients: Views (0.30), Reach (0.25), TotalInteractions (0.25), AverageWatchTime (0.10), TotalWatchTime (0.10)
   - Sort descending by score and return as flat list of `SocialAnalyticsPostRankingItemDTO`

### Repository Methods

**`SocialAnalyticsPostInsightRepository`:**
- `getLatestByPostGroupedByType(SocialAnalyticsPost)` — one insight per type (most recent), DB-level dedup
- `getByPostAndTypes(SocialAnalyticsPost, array)` — all insights for a post filtered by types, ordered by `createdAt ASC`
- `getByPostIdsAndTypes(array, array)` — all insights for multiple posts filtered by types, ordered by `createdAt ASC`
- `getLatestByPostGroupedByTypeBeforeDate(SocialAnalyticsPost, DateTimeImmutable, array)` — one insight per type (most recent before a date), DB-level dedup, for evolution comparison
- `getLatestByPostIdsGroupedByPostAndType(array)` — one insight per type per post (most recent) for multiple posts, DB-level dedup, for ranking score calculation

**`SocialAnalyticsPostRepository`:**
- `getByUserAndIntegrationAndPublishedBeforeLimited(User, Integration, DateTimeImmutable, int)` — N posts published before a date
- `getSingleByIntegrationAndPublishedBeforeDate(Integration, DateTimeImmutable)` — single previous post for evolution

### DTOs

| DTO | Purpose |
|-----|---------|
| `ShowSocialAnalyticsPostInsightDetailResponseDTO` | Main response DTO — contains nested `post` (SocialAnalyticsPost), `insightsWithEvolution`, engagement rates, timelines, and ranking |
| `SocialAnalyticsPostInsightWithEvolutionDTO` | Wraps a `SocialAnalyticsPostInsight` entity with `evolutionPercentage` |
| `SocialAnalyticsPostInsightTimelineDTO` | Timeline for one insight type |
| `SocialAnalyticsPostInsightTimelinePointDTO` | Single data point (hours, value, averageValue) |
| `SocialAnalyticsPostRankingItemDTO` | Ranking entry wrapping a `SocialAnalyticsPost` and a combined `score` |
| `ShowSocialAnalyticsPostInsightDetailQueryParamDTO` | Query parameter (`postUuid`) |

### Shared Helpers

- `InsightHelper::getInsightValueByType` — extracts a single insight value by enum type from an array of insight entities
- `InsightHelper::calculateEngagement` — computes engagement rate as `(interactions / divisor) * 100`
- `InsightEvolutionHelper::buildPostInsightsWithEvolution` — sorts insights by a given type order and computes evolution percentages vs. previous insights
- `TimelineGapFillerHelper::fillPostInsightTimelinePointsHourlyGaps` — fills missing hourly points between existing data points by copying values from the previous point
- `TimelineGapFillerHelper::fillIntegrationInsightTimelinePointsDailyGaps` — fills missing daily points between existing data points by copying values from the previous day

## Cleanup Notes

- **Stub controller methods removed**: `SocialAnalyticsPostInsightController` previously had unimplemented stub methods (`list`, `create`, `show`, `update`, `delete`) that exposed reachable API routes returning `null`/`200`. These were removed, keeping only the implemented `detail` endpoint.
- **`SocialAnalyticsPostController`** stubs (`create`, `show`, `update`, `delete`) were also removed — only `list` and `getThumbnail` remain.
- **Null safety**: `SocialAnalyticsPostService::getPostsWithInsights` now uses null-safe operator (`?->`) when accessing `$totalFollowers->getValue()`, preventing crashes when no TotalFollowers insight exists for an integration.
- **All controllers marked `final`** per coding style conventions.
