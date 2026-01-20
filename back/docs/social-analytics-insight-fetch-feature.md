# Social Analytics Insight Fetch Feature

## Overview

This feature fetches profile-level insights from Instagram's Graph API and stores them as `SocialAnalyticsInsight` entities for historical tracking.

## Architecture

```
SocialAnalyticsInsightService
    └── fetchInstagramProfileInsights(Integration $integration): array
        ├── Validates integration is Instagram provider
        ├── Calls InstagramOAuthService::refreshTokenIfNeeded()
        ├── Makes HTTP call to Instagram Insights API
        ├── Creates new SocialAnalyticsInsight entities (for history)
        ├── Updates Integration::lastSyncedAt
        └── Returns array of created insights

InstagramOAuthService
    └── refreshTokenIfNeeded(Integration $integration): Integration
        ├── Checks if token expires within 7 days
        ├── Refreshes token if needed
        └── Updates integration with new token
```

## Instagram API Details

**Endpoint:** `GET https://graph.instagram.com/{user_id}/insights`

**Query Parameters:**
- `metric`: `impressions,reach,profile_views,follower_count,website_clicks`
- `period`: `day`
- `access_token`: Integration's access token

**Response Format:**
```json
{
  "data": [
    {
      "name": "impressions",
      "period": "day",
      "values": [{ "value": 32, "end_time": "2026-01-19T08:00:00+0000" }],
      "title": "Impressions"
    }
  ]
}
```

## Metric Mapping

| Instagram API Metric | SocialAnalyticsInsightType |
|---------------------|---------------------------|
| `impressions` | `Impressions` |
| `reach` | `Reach` |
| `profile_views` | `Views` |
| `follower_count` | `Followers` |
| `website_clicks` | `ProfileLinksTaps` |

## Files

- **Service:** `src/Module/SocialAnalytics/Service/SocialAnalyticsInsightService.php`
- **DTO:** `src/DTO/External/Instagram/InstagramInsightDTO.php`
- **OAuth Service:** `src/Service/Integration/InstagramOAuthService.php`

## Usage

```php
// Inject SocialAnalyticsInsightService
$insights = $this->socialAnalyticsInsightService->fetchInstagramProfileInsights($integration);
```

## Token Refresh Logic

The `refreshTokenIfNeeded` method in `InstagramOAuthService`:
1. Checks if `expiresAt` is within 7 days
2. If yes, calls Instagram's refresh token endpoint
3. Updates the integration with new token and expiry
4. Persists changes to database

## Error Handling

- Throws `InvalidArgumentException` if integration is not Instagram provider
- HTTP errors from Instagram API will propagate as exceptions

## Notes

- Each call creates **new** insight entities for historical tracking
- `lastSyncedAt` is updated on the integration after successful fetch
- Requires `instagram_business_manage_insights` scope on the integration
