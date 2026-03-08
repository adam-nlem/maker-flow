# Home Page Feature

## Overview

The home page (`/`) is the main dashboard. It shows an overview of insights across all integrations and highlights the best-performing content via a ranking system.

## Layout

Two-column layout (`w-2/3` + `w-1/3`):

- **Left column**: `HomeScriptsList` (filtered scripts list with status pills) + `ScriptCalendar`
- **Right column**: `HomeInsightsOverview` + ranked posts or ranked post groups

## Components

### HomeInsightsOverview

**File:** `app/components/home/HomeInsightsOverview.tsx`

Displays integration selection (Pill components) and aggregated insight tiles. Fetches its own data via `useListIntegrationInsights({ projectUuid })`.

- Reads `focusedIntegrationUuid` from `useHomeFilterStore`
- When an integration is focused: shows its insights + `IntegrationProfileInfo`
- When "Toutes les plateformes" is selected (null): displays backend-provided `aggregatedInsights` (summed across all integrations per type)
- Shows 4 `InsightTile` components: TotalFollowers, Views, Likes, Comments

Props: `projectUuid`

### RankedPostsList

**File:** `app/components/home/RankedPostsList.tsx`

Calls `useListRankedPosts({ integrationUuid })`, renders posts using `HomeRankingItemTile`. Displays the Views metric for each post.

Props: `integrationUuid`

### RankedPostGroupsList

**File:** `app/components/home/RankedPostGroupsList.tsx`

Calls `useListRankedPostGroups({ projectUuid })`, renders post groups using `HomeRankingItemTile`. Displays group title, post count, and aggregated Views metric.

Props: `projectUuid`

### HomeScriptsList

**File:** `app/components/home/HomeScriptsList.tsx`

Displays a filtered, paginated list of scripts. A row of `Pill` components lets the user select a `ScriptStatus` filter (persisted via `useHomeFilterStore.focusedScriptStatus`). Uses `useListPaginatedScripts({ projectUuid, status, limit: 10 })` to fetch filtered scripts. Renders `ScriptListItem` components in a horizontal list (`overflow-x-auto`) with infinite scroll (IntersectionObserver sentinel, horizontal `rootMargin`). Fixed height (`h-40`). Clicking a script opens a `ScriptDetailModal` (read-only preview with "open editor" button).

Props: `projectUuid`

### HomeScriptsByStatus (unused)

**File:** `app/components/home/HomeScriptsByStatus.tsx`

Previously used to render scripts grouped by status. Now replaced by `HomeScriptsList`.

Props: `projectUuid`

### HomeRankingItemTile

**File:** `app/components/home/HomeRankingItemTile.tsx`

Ranking item tile for the home page. Displays rank number with a dotted connecting line, thumbnail, subtitle text, and a Views metric (eye icon + compact number).

Props: `index`, `postUuid?`, `subtitle`, `secondarySubtitle?`, `metricValue`, `isLast`

## Store

### useHomeFilterStore

**File:** `app/stores/homeFilterStore.ts`

Zustand store with persist middleware (`app:home:filter-store`).

| State | Type | Description |
|-------|------|-------------|
| `focusedIntegrationUuid` | `string \| null` | UUID of the focused integration, or null for all platforms |
| `focusedScriptStatus` | `ScriptStatus` | Selected script status filter (default: `Idea`) |

| Action | Description |
|--------|-------------|
| `setFocusedIntegrationUuid(uuid)` | Sets the focused integration |
| `setFocusedScriptStatus(status)` | Sets the script status filter |

## Hooks

| Hook | File | API Endpoint | Returns |
|------|------|-------------|---------|
| `useListIntegrationInsights` | `app/hooks/api/integrationInsights/useListIntegrationInsights.ts` | `GET /api/integration-insights` | `{ insightsOverview: IntegrationInsightsOverviewDTO \| null }` |
| `useListRankedPosts` | `app/hooks/api/posts/useListRankedPosts.ts` | `GET /api/posts/rank` | `{ posts: PostWithAggregatedInsightsDTO[] }` |
| `useListRankedPostGroups` | `app/hooks/api/postGroups/useListRankedPostGroups.ts` | `GET /api/post-groups/rank` | `{ postGroups: PostGroupWithAggregatedInsightsDTO[] }` |
| `useListScriptsByStatus` | `app/hooks/api/scripts/useListScriptsByStatus.ts` | `GET /api/scripts/by-status` | `{ scriptsByStatus: ScriptsGroupedByStatusDTO[] }` |
| `useListPaginatedScripts` | `app/hooks/api/scripts/useListPaginatedScripts.ts` | `GET /api/scripts` | `{ scripts, isLoading, isLoadingMore, hasMore, listMore }` |

## Models & DTOs

| File | Description |
|------|-------------|
| `app/models/PostGroup.ts` | PostGroup model (uuid, title, createdAt, updatedAt, posts?) |
| `app/dtos/posts/PostWithAggregatedInsightsDTO.ts` | Post with aggregated insights (post, aggregatedInsights) |
| `app/dtos/postGroups/PostGroupWithAggregatedInsightsDTO.ts` | Post group with aggregated insights (postGroup, aggregatedInsights) |
| `app/dtos/integrationInsights/IntegrationInsightsOverviewDTO.ts` | Overview DTO: groups (per integration) + aggregatedInsights (summed across all) |
| `app/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO.ts` | Integration with its latest insights (integration, insights[]) |
| `app/dtos/scripts/ScriptsGroupedByStatusDTO.ts` | Scripts grouped by status (status, scripts[]) |

## Query Keys

- `postQueryKeys.rank(integrationUuid)` — `["posts", "rank", integrationUuid]`
- `postGroupQueryKeys.rank(projectUuid)` — `["postGroups", "rank", projectUuid]`
- `integrationInsightQueryKeys.list(projectUuid)` — `["integrationInsights", "list", projectUuid]`
- `scriptQueryKeys.byStatus(projectUuid)` — `["scripts", "byStatus", projectUuid]`
