# Home Page Feature

## Overview

The home page (`/`) is the main dashboard. It shows an overview of insights across all integrations and highlights the best-performing content via a ranking system.

## Layout

Two-column layout (`w-2/3` + `w-1/3`). The content wrapper uses `h-screen overflow-hidden` to constrain both columns to viewport height. The flex row has `h-full` to propagate the height.

- **Left column** (`overflow-y-auto scrollbar-none`): `HomeScriptsList` (filtered scripts list with status pills) + `ScriptCalendar`. Scrolls independently.
- **Right column** (`min-h-0`): `HomeInsightsOverview` + ranked posts or ranked post groups. The `min-h-0` allows `flex-1 min-h-0` in child ranked list components to work, enabling their internal `overflow-y-auto` scrollable containers.

## Empty State

When `integrations.length === 0`, the right column renders `ConnectIntegrationPlaceholder` instead of `HomeInsightsOverview` and ranked lists. This prevents unnecessary API calls and shows the user a CTA to connect an account via `/settings/integrations`.

## Components

### HomeInsightsOverview

**File:** `app/components/home/HomeInsightsOverview.tsx`

Displays integration selection via `IntegrationPillRow` and aggregated insight tiles. Fetches its own data via `useListIntegrationInsights({ projectUuid })`.

- Reads `focusedIntegrationUuid` from `useFocusIntegrationStore`
- When an integration is focused: shows its insights + `IntegrationProfileInfo`
- When "Toutes les plateformes" is selected (null): displays backend-provided `aggregatedInsights` (summed across all integrations per type)
- Shows 4 `InsightTile` components: TotalFollowers, Views, Likes, Comments

Props: `projectUuid`

### RankedPostsList

**File:** `app/components/home/RankedPostsList.tsx`

Calls `useListPaginatedRankedPosts({ integrationUuid })`, renders posts using `RankingItemTile` with infinite scroll (IntersectionObserver sentinel, vertical `rootMargin`). Outer container uses `flex-1 min-h-0`, inner scrollable div uses `overflow-y-auto scrollbar-none flex-1 min-h-0`. Displays Views, Likes, and Comments metrics for each post.

Props: `integrationUuid`

### RankedPostGroupsList

**File:** `app/components/home/RankedPostGroupsList.tsx`

Calls `useListPaginatedRankedPostGroups({ projectUuid })`, renders post groups using `RankingItemTile` with infinite scroll (IntersectionObserver sentinel, vertical `rootMargin`). Outer container uses `flex-1 min-h-0`, inner scrollable div uses `overflow-y-auto scrollbar-none flex-1 min-h-0`. Displays group title, post count, and aggregated Views, Likes, and Comments metrics.

Props: `projectUuid`

### HomeScriptsList

**File:** `app/components/home/HomeScriptsList.tsx`

Displays a filtered, paginated list of scripts. A row of `Pill` components lets the user select a `ScriptStatus` filter (persisted via `useScriptFilterStore.focusedScriptStatus`). Uses `useListPaginatedScripts({ projectUuid, status, limit: 10 })` to fetch filtered scripts. Renders `ScriptListItem` components in a horizontal list (`overflow-x-auto`) with infinite scroll (IntersectionObserver sentinel, horizontal `rootMargin`). Fixed height (`h-40`). Clicking a script opens a `ScriptDetailModal` (read-only preview with "open editor" button).

Props: `projectUuid`

### HomeRankingItemTile

**File:** `app/components/home/HomeRankingItemTile.tsx`

Ranking item tile for the home page. Displays rank number with a dotted connecting line, thumbnail, subtitle text, and a Views metric (eye icon + compact number).

Props: `index`, `postUuid?`, `subtitle`, `secondarySubtitle?`, `metricValue`, `isLast`

## Stores

### useFocusIntegrationStore

**File:** `app/stores/integrations/focusIntegrationStore.ts`

Zustand store with persist middleware (`app:integrations:focus`). Shared across home and insights pages.

| State | Type | Description |
|-------|------|-------------|
| `focusedIntegrationUuid` | `string \| null` | UUID of the focused integration, or null for all platforms |

| Action | Description |
|--------|-------------|
| `setFocusedIntegrationUuid(uuid)` | Sets the focused integration |

### useScriptFilterStore

**File:** `app/stores/scripts/scriptFilterStore.ts`

Zustand store with persist middleware (`app:scripts:filter`).

| State | Type | Description |
|-------|------|-------------|
| `focusedScriptStatus` | `ScriptStatus` | Selected script status filter (default: `Idea`) |

| Action | Description |
|--------|-------------|
| `setFocusedScriptStatus(status)` | Sets the script status filter |

## Shared Components

### IntegrationPillRow

**File:** `app/components/integrations/IntegrationPillRow.tsx`

Reusable row of `Pill` components for selecting an integration. Reads/writes `focusedIntegrationUuid` from `useFocusIntegrationStore` directly. Includes a "Toutes les plateformes" option (sets UUID to null). Used in `HomeInsightsOverview` and `InsightsPageView`.

Props: `integrations: Integration[]`

## Hooks

| Hook | File | API Endpoint | Returns |
|------|------|-------------|---------|
| `useListIntegrationInsights` | `app/hooks/api/integrationInsights/useListIntegrationInsights.ts` | `GET /api/integration-insights` | `{ insightsOverview: IntegrationInsightsOverviewDTO \| null }` |
| `useListPaginatedRankedPosts` | `app/hooks/api/posts/useListPaginatedRankedPosts.ts` | `GET /api/posts/rank` | `{ posts, isLoading, isLoadingMore, hasMore, error, listMore }` |
| `useListPaginatedRankedPostGroups` | `app/hooks/api/postGroups/useListPaginatedRankedPostGroups.ts` | `GET /api/post-groups/rank` | `{ postGroups, isLoading, isLoadingMore, hasMore, error, listMore }` |
| `useListPaginatedScripts` | `app/hooks/api/scripts/useListPaginatedScripts.ts` | `GET /api/scripts` | `{ scripts, isLoading, isLoadingMore, hasMore, listMore }` |

## Models & DTOs

| File | Description |
|------|-------------|
| `app/models/PostGroup.ts` | PostGroup model (uuid, title, createdAt, updatedAt, posts?) |
| `app/dtos/posts/PostWithAggregatedInsightsDTO.ts` | Post with aggregated insights (post, aggregatedInsights) |
| `app/dtos/postGroups/PostGroupWithAggregatedInsightsDTO.ts` | Post group with aggregated insights (postGroup, aggregatedInsights) |
| `app/dtos/integrationInsights/IntegrationInsightsOverviewDTO.ts` | Overview DTO: groups (per integration) + aggregatedInsights (summed across all) |
| `app/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO.ts` | Integration with its latest insights (integration, insights[]) |

## Query Keys

- `postQueryKeys.rank(integrationUuid)` — `["posts", "rank", integrationUuid]`
- `postGroupQueryKeys.rank(projectUuid)` — `["postGroups", "rank", projectUuid]`
- `integrationInsightQueryKeys.list(projectUuid)` — `["integrationInsights", "list", projectUuid]`
