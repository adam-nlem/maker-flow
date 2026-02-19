# Social Analytics Module - Frontend Documentation

## Overview

The Social Analytics module provides Instagram analytics: follower trends, post insights, engagement metrics, and a posts table. It lives under `front/app/modules/socialAnalytics/`.

## Module Routing

The Social Analytics module uses a **module-level router** (`SocialAnalyticsRouter.tsx`) registered as the `pageView` and `router` in the module registry. The generic route `modules/:moduleIdentifier/*` renders the module router, which then handles internal sub-routes using React Router's `<Routes>` / `<Route>` pattern.

### Routes handled by the module router

| Path | Component | Description |
|------|-----------|-------------|
| `/modules/social_analytics` | `SocialAnalyticsPageView` | Main page with filters, integration selector, and posts table |
| `/modules/social_analytics/posts/:postUuid` | `SocialAnalyticsPostDetailPage` | Post detail with insight tiles and timeline charts |

### File structure

```
modules/socialAnalytics/
├── SocialAnalyticsRouter.tsx              # Module router (pageView entry point)
├── pages/
│   └── SocialAnalyticsPostDetailPage.tsx  # Post detail page (extracts params, renders view)
├── components/
│   └── ...
```

## Page Layout

The social analytics page uses a flex column layout that fills the viewport height so the posts table can scroll internally while keeping upper content (filters, profile, tiles) visible.

### Layout chain

```
SocialAnalyticsPageView          h-screen overflow-hidden, flex flex-col
  [filter bar]                   fixed height
  SocialAnalyticsIntegrationPageView   flex-1 min-h-0, flex flex-col
    [warning banner]             fixed height
    [profile + insight tiles]    fixed height
    ListSocialAnalyticsPostsTable  flex-1 min-h-0, flex flex-col
      <h1>                       fixed height
      DataTable                  flex-1 min-h-0 (generic reusable table)
        <table>
          <thead>                sticky top-0 bg-white z-10
          <tbody>                scrollable content
        [sentinel div]           h-1, afterTable slot, IntersectionObserver trigger
```

### Key patterns

- **`h-screen` on the page root** establishes the viewport constraint. Combined with `overflow-hidden` to prevent the page itself from scrolling.
- **`flex-1 min-h-0`** on intermediate flex children allows them to shrink below their content size, which is required for overflow to work in nested flex layouts.
- **Sticky `<thead>`** keeps column headers visible while the table body scrolls.

## Components

| Component | File | Role |
|-----------|------|------|
| `SocialAnalyticsRouter` | `SocialAnalyticsRouter.tsx` | Module router handling internal sub-routes |
| `SocialAnalyticsPageView` | `components/SocialAnalyticsPageView.tsx` | Page root with filters and integration selector |
| `SocialAnalyticsIntegrationPageView` | `components/integrations/SocialAnalyticsIntegrationPageView.tsx` | Integration detail: profile, insight tiles, posts table |
| `ListSocialAnalyticsPostsTable` | `components/posts/ListSocialAnalyticsPostsTable.tsx` | Posts table using `DataTable` with column definitions and infinite scroll |
| `SocialAnalyticsPostDescriptionCell` | `components/posts/SocialAnalyticsPostDescriptionCell.tsx` | Thumbnail + caption + relative date cell (uses `useShowSocialAnalyticsPostThumbnail` hook) |
| `SocialAnalyticsPostNumericCell` | `components/posts/SocialAnalyticsPostNumericCell.tsx` | Numeric metric content with optional tooltip (no `<td>` wrapper) |
| `SocialAnalyticsPostDurationCell` | `components/posts/SocialAnalyticsPostDurationCell.tsx` | Duration metric content formatted in French (no `<td>` wrapper) |
| `SocialAnalyticsPostEvolutionBadge` | `components/posts/SocialAnalyticsPostEvolutionBadge.tsx` | Evolution percentage badge (green/red) |
| `SocialAnalyticsInsightTile` | `components/SocialAnalyticsInsightTile.tsx` | Metric tile with optional area chart |
| `SocialAnalyticsPostDetailPageView` | `components/posts/SocialAnalyticsPostDetailPageView.tsx` | Post detail page with insight tiles and timeline charts |
| `SocialAnalyticsPostInsightSummaryCard` | `components/posts/SocialAnalyticsPostInsightSummaryCard.tsx` | Visibility summary grid card (Views, Reach, AvgWatchTime, TotalWatchTime) with evolution badges; formats watch time values with `formatDurationToFrench` |
| `SocialAnalyticsPostDetailPage` | `pages/SocialAnalyticsPostDetailPage.tsx` | Page wrapper that extracts `postUuid` param |
| `SocialAnalyticsDashboardContent` | `components/SocialAnalyticsDashboardContent.tsx` | Dashboard card grid: routes Active integrations to `SocialAnalyticsIntegrationCard`, Revoked/missing to `CreateSocialAnalyticsIntegrationCard` |
| `SocialAnalyticsIntegrationCard` | `components/integrations/SocialAnalyticsIntegrationCard.tsx` | Active integration card: profile picture, name, provider icon, insight value for selected type |
| `CreateSocialAnalyticsIntegrationCard` | `components/integrations/CreateSocialAnalyticsIntegrationCard.tsx` | Placeholder card with shimmer + "Se connecter" button. Used for both new connections and re-auth of revoked integrations |
| `FilterTile` | `components/FilterTile.tsx` | Filter chip used in dropdowns |
| `LineChart` | `~/components/ui/LineChart.tsx` | Recharts line chart with current vs average lines |

## Models

- `SocialAnalyticsPost` — Post model with `uuid`, `externalId`, `mediaType`, `publishedAt`, `caption`, `externalUrl`, `duration`
- `SocialAnalyticsPostInsight` — Insight entity with `uuid`, `type`, `value`, `createdAt`, `updatedAt`

## DTOs

### Post List DTOs

- `SocialAnalyticsPostWithInsightsDTO` — Wraps a nested `SocialAnalyticsPost` (under `post` key) + `insights` array + engagement rates (`engagementByFollowers`, `engagementByReach`)
- `SocialAnalyticsPostInsightWithEvolutionDTO` — Wraps a nested `SocialAnalyticsPostInsight` (`insight.type`, `insight.value`) with `evolutionPercentage`

### Post Detail DTOs

- `SocialAnalyticsPostInsightDetailDTO` — Main detail response with nested `post` (SocialAnalyticsPost), `insightsWithEvolution`, engagement rates, `timelines`, and `ranking`
- `SocialAnalyticsPostInsightTimelineDTO` — Timeline per insight type
- `SocialAnalyticsPostInsightTimelinePointDTO` — Individual data point with `hoursAfterPublication`, `value`, `averageValue`
- `SocialAnalyticsPostRankingItemDTO` — Ranking entry wrapping a `SocialAnalyticsPost` and a combined `score`

## Stores

- **`socialAnalyticsFilterStore`** — Zustand store holding `insightType`, `timePeriod`, and `focusedIntegrationUuid` filters.

## API Hooks

- `useShowSocialAnalyticsIntegrationDetail` — Fetches integration detail (followers, daily points, post count, streak).
- `useListPaginatedSocialAnalyticsPosts` — Paginated post list with `hasMore` / `listMore` for infinite scroll.
- `useShowSocialAnalyticsPostInsightDetail` — Fetches post detail with insight tiles, evolution, engagement rates, timeline data for charts, and ranking data.

## Infinite Scroll

`ListSocialAnalyticsPostsTable` uses an `IntersectionObserver` on a sentinel `<div>` passed via DataTable's `afterTable` prop. The sentinel is placed after the `<table>` inside the scrollable wrapper. When it enters the viewport (with a 200px bottom margin), the next page is fetched automatically via `listMore()`. The component reads `timePeriod` from `useSocialAnalyticsFilterStore` and applies `filterPostsByDays` locally.

## Post Detail Page

Clicking a table row navigates to `/modules/social_analytics/posts/:postUuid`. The route is handled by the module router (`SocialAnalyticsRouter`), which renders `SocialAnalyticsPostDetailPage`.

### Layout

```
┌─────────────────────────────────────────────────────┐
│ ← Retour                                            │
│                                                      │
│ [thumbnail] Caption text...                          │
│             published date (relative)                │
│                                                      │
│ [Views] [Likes] [Comments] [Shares] [Saved]         │
│ [TotalInteractions] [AvgWatchTime] [TotalWatchTime]  │
│ [Engagement/Followers] [Engagement/Reach]            │
│                                                      │
│ ┌─ Vues ───────────────────────────────────────────┐ │
│ │         [LineChart: views vs avg]                 │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─ Temps de visionnage ─ [Moyen] [Total] ──────────┐│
│ │         [LineChart: selected metric vs avg]       │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─ Engagement ─ [J'aime] [Commentaires] [Partages] ┐│
│ │         [LineChart: selected metric vs avg]       │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Charts

Each chart is a `LineChart` component (Recharts) showing two lines:
- **Primary line** (solid, primary color): current post's metric values over time
- **Average line** (dashed, gray): average of the 10 previous posts at the same hours-after-publication offset

X-axis uses `formatDurationToFrench()` (via a local helper converting hours to seconds) to display "2h", "1j 5h", etc.

## Thumbnail Hook

`useShowSocialAnalyticsPostThumbnail` fetches post thumbnails as blobs and creates object URLs for display. The hook stores the raw `Blob` in React Query's cache (not the object URL), then creates the object URL via `useMemo` and revokes it on cleanup via `useEffect`. This prevents memory leaks from unreleased object URLs accumulating over time.

## Provider-Specific Banners

`SocialAnalyticsIntegrationPageView` displays conditional info banners depending on the integration provider:

- **Instagram** (amber): Explains that Instagram does not provide historical data, so analytics are built incrementally over time. Only shown when `integration.provider === IntegrationProvider.Instagram`.
- **YouTube** (blue): Shown when `detail.isYoutubeReportPending === true`. Explains that YouTube reporting jobs take 24-48 hours to generate after initial connection. Displays a spinning `ArrowPathIcon` animation to indicate the process is ongoing. The banner disappears once all reporting jobs have processed at least one report.

## Cleanup Notes

- **Design system colors**: Evolution badges and insight tiles use `text-green` / `bg-pastel-green` (positive) and `text-danger` / `bg-danger/10` (negative) from the design system instead of hardcoded Tailwind color classes.
- **Dashboard integration routing**: `SocialAnalyticsDashboardContent` iterates `integrationProviderTypeOptions` and renders `SocialAnalyticsIntegrationCard` for Active integrations or `CreateSocialAnalyticsIntegrationCard` for Revoked/missing integrations. This means revoked integrations show the same shimmer + "Se connecter" card as providers with no integration at all, reusing the existing OAuth flow for re-authentication.
- **Post detail safe rendering**: The timeline chart renders conditionally when the selected timeline exists. Engagement progress bars use `?? 0` fallback for nullable values. The empty placeholder div was removed and the chart section takes full width.
