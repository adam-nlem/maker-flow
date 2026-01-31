# Social Analytics Module - Frontend Documentation

## Overview

The Social Analytics module provides Instagram analytics: follower trends, post insights, engagement metrics, and a posts table. It lives under `front/app/modules/socialAnalytics/`.

## Page Layout

The social analytics page uses a flex column layout that fills the viewport height so the posts table can scroll internally while keeping upper content (filters, profile, tiles) visible.

### Layout chain

```
SocialAnalyticsPageView          h-screen overflow-hidden, flex flex-col
  [filter bar]                   fixed height
  SocialAnalyticsIntegrationPageView   flex-1 min-h-0, flex flex-col
    [warning banner]             fixed height
    [profile + insight tiles]    fixed height
    SocialAnalyticsPostsTable    flex-1 min-h-0, flex flex-col
      <h1>                       fixed height
      [table wrapper]            flex-1 min-h-0 overflow-auto
        <table>
          <thead>                sticky top-0 bg-white z-10
          <tbody>                scrollable content
      [load more button]         fixed height (conditional)
```

### Key patterns

- **`h-screen` on the page root** establishes the viewport constraint. Combined with `overflow-hidden` to prevent the page itself from scrolling.
- **`flex-1 min-h-0`** on intermediate flex children allows them to shrink below their content size, which is required for overflow to work in nested flex layouts.
- **Sticky `<thead>`** keeps column headers visible while the table body scrolls.

## Components

| Component | File | Role |
|-----------|------|------|
| `SocialAnalyticsPageView` | `components/SocialAnalyticsPageView.tsx` | Page root with filters and integration selector |
| `SocialAnalyticsIntegrationPageView` | `components/integrations/SocialAnalyticsIntegrationPageView.tsx` | Integration detail: profile, insight tiles, posts table |
| `SocialAnalyticsPostsTable` | `components/posts/SocialAnalyticsPostsTable.tsx` | Scrollable posts table with sticky headers |
| `SocialAnalyticsPostsTableRow` | `components/posts/SocialAnalyticsPostsTableRow.tsx` | Individual post row |
| `SocialAnalyticsInsightTile` | `components/SocialAnalyticsInsightTile.tsx` | Metric tile with optional area chart |
| `FilterTile` | `components/FilterTile.tsx` | Filter chip used in dropdowns |

## Stores

- **`socialAnalyticsFilterStore`** — Zustand store holding `insightType`, `timePeriod`, and `focusedIntegrationUuid` filters.

## API Hooks

- `useShowSocialAnalyticsIntegrationDetail` — Fetches integration detail (followers, daily points, post count, streak).
- `useListPaginatedSocialAnalyticsPosts` — Paginated post list with `hasMore` / `listMore` for load-more.
