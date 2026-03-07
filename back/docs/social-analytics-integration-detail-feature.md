# Social Analytics Integration Insights Feature

## Overview

This feature provides endpoints for listing and viewing integration insights. The list endpoint returns all insights for a project grouped by integration, while the detail endpoint returns aggregated insight data with evolution percentages and daily data points for charting.

---

## List Endpoint

**GET** `/api/integration-insights`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectUuid` | string (UUID) | Yes | UUID of the project |

### Response

Returns an object with integration insight groups (one per integration) and aggregated insights across all integrations:

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
  "aggregatedInsights": [
    { "type": "views", "value": 5678 },
    { "type": "total_followers", "value": 12500 }
  ]
}
```

### Architecture

```
Controller
    ├── ProjectRepository (project lookup)
    └── IntegrationInsightService::list()
        ├── IntegrationRepository::getByProjectAndUser() (integrations)
        └── IntegrationInsightRepository
            ├── getLatestByUserAndByIntegration() (latest insights per integration)
            └── getAggregatedLatestByProjectAndUser() (summed across all integrations per type)
```

### Response DTOs

- `ListIntegrationInsightsResponseDTO` wraps `groups` (array of `ListIntegrationInsightsGroupedByIntegrationResponseDTO`) and `aggregatedInsights` (array of `{type, value}`)
- `ListIntegrationInsightsGroupedByIntegrationResponseDTO` groups an `Integration` entity with its latest `IntegrationInsight[]`. The `Integration` entity is serialized using the `api_integration_insights_list` serialization group.

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
        ├── InsightHelper (extracting insight values)
        ├── TimelineGapFillerHelper (fills missing daily data points)
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
│           ├── ListIntegrationInsightsGroupedByIntegrationResponseDTO.php
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
│   └── PostRepository.php
└── Service/
    └── IntegrationInsightService.php
```

---

## Notes

- Timelines are returned for these insight types: TotalFollowers, Comments, Shares, Saves, Views, Reach, Likes
- The controller hardcodes the time period to `LastYear`, so the backend always returns a **full year** of `timelines` data
- **Insight tile values are computed on the frontend**: the dynamic insight tiles display the sum of daily values within the selected time period, computed via `computeTotalValue(getFilteredInsightsForType(...))` in `insightChartDataHelper.ts`. This means tile values update reactively when the user changes the time period filter, without an additional API call.
- The `InsightEvolutionHelper` and `InsightHelper` are shared with `PostService` and `PostInsightService` to avoid code duplication
- The detail logic lives in `IntegrationInsightService` alongside the fetch logic (one service per domain)
