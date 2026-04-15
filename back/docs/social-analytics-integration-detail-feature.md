# Social Analytics Integration Insights Feature

## Overview

This feature provides endpoints for listing and viewing integration insights. The list endpoint returns all insights for a project — grouped by integration, plus an aggregated overview (KPIs with evolution) and a per-platform views timeline computed for the requested time period. The detail endpoint returns aggregated insight data for a single integration with evolution percentages and daily data points for charting.

---

## List Endpoint

**GET** `/api/integration-insights`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectUuid` | string (UUID) | Yes | UUID of the project |
| `timePeriod` | string | No | One of `last_7_days`, `last_30_days`, `last_year`. Defaults to `last_7_days` when absent or invalid. Drives the period used to compute `overview` and `viewsTimeline`. |

### Response

Returns the integration insight groups (one per integration), an `overview` of aggregated KPIs with evolution, and a per-platform daily views timeline:

```json
{
  "groups": [
    {
      "integration": {
        "uuid": "...",
        "platform": "instagram",
        "accountId": "12345",
        "userName": "myaccount",
        "name": "My Account",
        "profilePictureUrl": "https://...",
        "createdAt": "2026-01-01T00:00:00+00:00",
        "updatedAt": null,
        "expiresAt": "2026-06-01T00:00:00+00:00",
        "lastSyncedAt": "2026-03-05T10:00:00+00:00",
        "status": "active"
      },
      "insights": [
        {
          "uuid": "...",
          "type": "views",
          "value": 1234,
          "valueFormat": "number",
          "createdAt": "2026-03-05T10:00:00+00:00",
          "updatedAt": null
        }
      ]
    }
  ],
  "overview": {
    "totalFollowers": 29500,
    "totalFollowersEvolution": "+312",
    "totalViews": 428000,
    "totalViewsEvolution": "+18%",
    "engagementRate": 4.2,
    "engagementRateEvolution": "+0.4 pts",
    "totalReach": 312000,
    "totalReachEvolution": "-3%"
  },
  "viewsTimeline": [
    {
      "platform": "tiktok",
      "points": [
        { "date": "2026-04-01", "value": 10000 }
      ]
    }
  ]
}
```

### Architecture

```
Controller
    ├── ProjectRepository (project lookup)
    └── IntegrationInsightService::list()
        ├── IntegrationRepository::getByProjectAndUser() (integrations)
        ├── buildGroups()
        │   ├── PostInsightRepository::getGrowthByProjectAndUserAndTypesInPeriodGroupedByIntegration() (per-integration growth)
        │   └── IntegrationInsightRepository::getLatestTotalFollowersByProjectAndUserGroupedByIntegration() (batched followers per integration)
        ├── buildOverview()
        │   ├── PostInsightRepository::getGrowthByProjectAndUserAndTypesInPeriod() (current + previous period growth)
        │   ├── IntegrationInsightRepository::getAggregatedTotalFollowersByProjectAndUserBeforeDate() (current + previous followers)
        │   ├── InsightHelper::calculateEngagement()
        │   ├── InsightEvolutionHelper::calculateEvolutionPercentage() (views, reach)
        │   ├── InsightEvolutionHelper::calculateEvolutionPoints() (engagement rate)
        │   └── InsightEvolutionHelper::calculateAbsoluteEvolution() (followers)
        └── buildViewsTimeline()
            ├── PostInsightRepository::getDailyGrowthByProjectAndUserAndTypeInPeriod() (daily views by platform)
            └── TimelineGapFillerHelper::fillIntegrationInsightsViewsTimelinePointsDailyGaps() (zero-fills missing days)
```

### Response DTOs

- `ListIntegrationInsightsResponseDTO` — wraps `groups` (`ListIntegrationInsightsGroupedByIntegrationResponseDTO[]`), `overview` (`IntegrationInsightsOverviewDTO`) and `viewsTimeline` (`IntegrationInsightsViewsTimelineDTO[]`).
- `ListIntegrationInsightsGroupedByIntegrationResponseDTO` — groups an `Integration` entity with its latest `IntegrationInsight[]`. The `Integration` entity is serialized using the `api_integration_insights_list` serialization group.
- `IntegrationInsightsOverviewDTO` — flat KPIs + evolution strings (`totalFollowers`, `totalFollowersEvolution`, `totalViews`, `totalViewsEvolution`, `engagementRate`, `engagementRateEvolution`, `totalReach`, `totalReachEvolution`).
- `IntegrationInsightsViewsTimelineDTO` / `IntegrationInsightsViewsTimelinePointDTO` — per-platform daily points (`platform`, `points: [{ date, value }]`).

---

## Detail Endpoint

**GET** `/api/integration-insights/detail`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `integrationUuid` | string | Yes | UUID of the integration |

> **Note:** The time period is hardcoded to `LastYear` in the controller. There is no `timePeriod` query parameter.

### Response

```json
{
  "totalFollowers": 12500,
  "postCount": 42,
  "streak": 5,
  "insights": [
    {
      "type": "total_followers",
      "value": 12500,
      "evolutionPercentage": 3.2
    }
  ],
  "timelines": [
    {
      "type": "likes",
      "points": [
        {
          "createdAt": "2026-01-28T00:00:00+00:00",
          "value": 150
        }
      ]
    }
  ],
  "isYoutubeReportPending": null
}
```

### Key Fields

- **totalFollowers**: Latest total followers count
- **postCount**: Total number of posts for the integration
- **streak**: Current consecutive posting streak (days)
- **insights**: Aggregated insight values with evolution percentage vs. previous period
- **timelines**: Insight data points grouped by type, used for charting. Each timeline has a `type` and an array of `points` (each with `createdAt` and `value`)
- **isYoutubeReportPending**: `null` for non-YouTube integrations, `true` if YouTube reporting jobs have not yet produced reports (24-48h after connection), `false` when all jobs have processed at least one report. Computed by checking `YoutubeReportingJob.lastProcessedReportDate` via `YoutubeReportingJobRepository::getByIntegration()`

---

## Architecture

```
Controller
    └── IntegrationInsightService
        ├── IntegrationInsightRepository (insights by time period)
        │   └── InsightEvolutionHelper (evolution calculation)
        ├── InsightHelper (extracting insight values, engagement calc)
        ├── TimelineGapFillerHelper (fills missing daily data points)
        ├── PostInsightRepository (period-based growth queries)
        └── PostRepository (post count, streak)
```

---

## Files

```
src/
├── Controller/
│   └── IntegrationInsightController.php
├── DTO/
│   ├── QueryParam/
│   │   └── IntegrationInsight/
│   │       ├── ListIntegrationInsightsQueryParamDTO.php
│   │       └── ShowIntegrationDetailQueryParamDTO.php
│   └── Response/
│       └── IntegrationInsight/
│           ├── ListIntegrationInsightsResponseDTO.php
│           ├── ListIntegrationInsightsGroupedByIntegrationResponseDTO.php
│           ├── IntegrationInsightsOverviewDTO.php
│           ├── IntegrationInsightsViewsTimelineDTO.php
│           ├── IntegrationInsightsViewsTimelinePointDTO.php
│           ├── ShowIntegrationDetailResponseDTO.php
│           ├── IntegrationInsightTimelineDTO.php
│           ├── IntegrationInsightTimelinePointDTO.php
│           └── IntegrationInsightWithEvolutionDTO.php
├── Helper/
│   ├── InsightEvolutionHelper.php
│   ├── InsightHelper.php
│   └── TimelineGapFillerHelper.php
├── Repository/
│   ├── IntegrationInsightRepository.php
│   ├── PostInsightRepository.php
│   └── PostRepository.php
└── Service/
    └── IntegrationInsight/
        └── IntegrationInsightService.php
```

---

## Notes

- The list endpoint's `overview` and `viewsTimeline` are computed from `PostInsight` snapshots (cumulative per-post values), while `groups[].insights` and `overview.totalFollowers` come from `IntegrationInsight` (account-level data).
- For period-based metrics, growth is computed as `latest_in_period - baseline_before_period` per post; new posts published during the period contribute their full latest value.
- The daily views timeline uses a native SQL `LAG()` window function to compute per-snapshot diffs, then aggregates by platform + date. Missing dates are zero-filled via `TimelineGapFillerHelper::fillIntegrationInsightsViewsTimelinePointsDailyGaps()`.
- Singular `IntegrationInsight*` DTOs (e.g., `IntegrationInsightTimelineDTO`) are scoped to a single integration. Plural `IntegrationInsights*` DTOs (e.g., `IntegrationInsightsOverviewDTO`) represent project-wide aggregates.
- Detail endpoint timelines are returned for: TotalFollowers, Comments, Shares, Saves, Views, Reach, Likes
- The detail controller hardcodes the time period to `LastYear`, so the backend always returns a **full year** of `timelines` data
- **Insight tile values for the detail page are computed on the frontend**: the dynamic insight tiles display the sum of daily values within the selected time period, computed via `computeTotalValue(getFilteredInsightsForType(...))` in `insightChartDataHelper.ts`. This means tile values update reactively when the user changes the time period filter, without an additional API call.
- `InsightEvolutionHelper` and `InsightHelper` are shared with `PostService` and `PostInsightService` to avoid code duplication.
