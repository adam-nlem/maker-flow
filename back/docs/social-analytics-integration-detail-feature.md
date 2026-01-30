# Social Analytics Integration Detail Feature

## Overview

This feature provides a detail endpoint that returns aggregated Instagram integration insights, including current values with evolution percentages and daily data points for charting.

---

## Endpoint

**GET** `/api/modules/social-analytics/integration-insights/detail`

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `integrationUuid` | string | Yes | - | UUID of the integration |
| `timePeriod` | string | No | `last_7_days` | Time period filter (`last_7_days`, `last_30_days`, `last_90_days`, `last_year`) |

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
  "dailyPoints": [
    {
      "type": "likes",
      "insights": [
        {
          "uuid": "...",
          "type": "likes",
          "value": 150,
          "date": "2026-01-28T00:00:00+00:00"
        }
      ],
      "totalValue": 1200
    }
  ]
}
```

### Key Fields

- **totalFollowers**: Latest total followers count
- **postCount**: Total number of posts for the integration
- **streak**: Current consecutive posting streak (days)
- **insights**: Aggregated insight values with evolution percentage vs. previous period
- **dailyPoints**: Daily insight data points grouped by type, used for charting
  - **totalValue**: Sum of all `insights[].value` within the daily points for that type and selected time period

---

## Architecture

```
Controller
    └── SocialAnalyticsIntegrationDetailService
        ├── SocialAnalyticsIntegrationInsightRepository (insights by time period)
        │   └── InsightEvolutionHelper (evolution calculation)
        └── SocialAnalyticsPostRepository (post count, streak)
```

---

## Files

```
src/Module/SocialAnalytics/
├── Controller/
│   └── SocialAnalyticsIntegrationInsightController.php
├── DTO/
│   └── Response/
│       └── SocialAnalyticsIntegrationInsight/
│           ├── ShowSocialAnalyticsIntegrationDetailResponseDTO.php
│           ├── SocialAnalyticsIntegrationInsightDailyPointsDTO.php
│           └── SocialAnalyticsIntegrationInsightWithEvolutionDTO.php
├── Helper/
│   └── InsightEvolutionHelper.php
├── Repository/
│   ├── SocialAnalyticsIntegrationInsightRepository.php
│   └── SocialAnalyticsPostRepository.php
└── Service/
    └── SocialAnalyticsIntegrationDetailService.php
```

---

## Notes

- Daily points are returned for these insight types: TotalFollowers, Comments, Shares, Saves, Views, Reach, Likes
- The `totalValue` on each daily points entry is the sum of all daily insight values for that type within the selected time period
- The `InsightEvolutionHelper` is shared with `SocialAnalyticsPostService` to avoid code duplication
