# Social Analytics Integration Detail Feature

## Overview

This feature provides a detail endpoint that returns aggregated Instagram integration insights, including current values with evolution percentages and daily data points for charting.

---

## Endpoint

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
│   └── Response/
│       └── IntegrationInsight/
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
