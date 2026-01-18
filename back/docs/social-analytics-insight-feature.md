# Social Analytics Insight Feature

## Overview

This feature provides unified social media analytics insights for connected integrations (e.g., Instagram, TikTok). It aggregates data from both profile-level snapshots (followers, profile views) and post-level performance (likes, comments, post views).

## Architecture

### Backend

- **Entity**: `SocialAnalyticsInsight`
  - Stores unified metrics using a generic structure:
    - `type`: `SocialAnalyticsInsightType` (Enum: `views`, `likes`, `followers`, etc.)
    - `value`: `int` (The metric value)
  - Linked to `Integration` (for profile snapshots) OR `SocialAnalyticsPost` (for post snapshots).
- **Repository**: `SocialAnalyticsInsightRepository`
  - `getAggregatedInsightsByIntegrationAndPeriod`: Aggregates insights by type for a given integration and time period.
    - Uses `SUM` for flow metrics (likes, views, etc.).
    - Uses `MAX - MIN` for stock metrics (followers, videos) to calculate growth.
- **Service**: `SocialAnalyticsInsightService`
  - `getInsightsForIntegration`: Calls the repository to get the aggregated data.
- **Controller**: `SocialAnalyticsInsightController`
  - Endpoint: `GET /api/modules/social-analytics/insights`
  - Returns unified `ListSocialAnalyticsInsightResponseDTO`.

### Data Flow

1.  **Request**: Frontend requests insights for an `integrationUuid` and `timePeriod`.
2.  **Aggregation**:
    - Repository queries the `social_analytics_insight` table.
    - Groups results by `type` (e.g., all 'likes' rows).
    - Calculates totals or growth depending on the metric type.
3.  **Response**: Controller returns a single JSON object where keys are the metric types (from the Enum) and values are the aggregated numbers.

## API Endpoints

### List Insights

```http
GET /api/modules/social-analytics/insights?integrationUuid={uuid}&timePeriod={period}
```

**Query Parameters:**
- `integrationUuid`: UUID of the integration.
- `timePeriod`: `last_7_days`, `last_30_days`, etc.

**Response:**
```json
{
  "integration_uuid": "...",
  "time_period": "last_7_days",
  "views": 1200,
  "likes": 300,
  "comments": 50,
  "saves": 10,
  "shares": 5,
  "impressions": 2000,
  "reach": 1500,
  "dislikes": 0,
  "followers": 15,
  "videos": 2,
  "profile_links_taps": 3
}
```
