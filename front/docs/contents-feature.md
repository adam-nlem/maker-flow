# Contents Feature

## Overview

The Contents page (`/contents`) is the unified view for browsing post groups, individual posts, and their analytics. It replaces the old Insights page (`/insights`) and combines post groups, posts, and analytics in one place.

## Route

- **Path:** `/contents`
- Replaces the previous `/insights` route

## Layout

`ContentsPageView` uses a full-height layout with a top filter bar and a tabbed content area. A `SidePanel` slides in from the right for detail views and creation forms.

- **Top bar:** `ContentsPlatformFilter` (platform pills) + active tab selector (Groups / Posts)
- **Content area:** `ContentsList` renders either groups or posts based on `activeTab` from the store
- **Side panel:** mutually exclusive — only one panel is open at a time (group detail, post detail, or create group)

## Components

### ContentsPageView

**File:** `app/components/contents/ContentsPageView.tsx`

Main page component. Reads from `useContentsStore` for active tab, platform filter, and panel state. Renders the platform filter, tab switcher, `ContentsList`, and the appropriate `SidePanel`.

### ContentsList

**File:** `app/components/contents/ContentsList.tsx`

Unified list component for both groups and posts. Reads `activeTab` from the store to determine the mode. Calls both `useListPaginatedPostGroups` and `useListPaginatedPostsByProject` unconditionally (disabling the inactive one via `null` projectUuid). Uses `instanceof` for UUID extraction when mapping items to `ContentCard`. Includes infinite scroll via `useInfiniteScroll` hook.

### ContentCard

**File:** `app/components/contents/ContentCard.tsx`

Unified card component for both post groups and individual posts. Accepts a `data` prop typed as `PostGroupWithInsightsAndScriptDTO | PostWithPlatformAndInsightsDTO` and uses `instanceof` to determine the rendering variant. Shared: metrics row (views, engagement, interactions), selection state, click handling. Group-specific: title, post count, script badge. Post-specific: platform dot, caption, optional group title.

### ContentGroupDetailPanel

**File:** `app/components/contents/ContentGroupDetailPanel.tsx`

`SidePanel` showing full details of a post group: title, linked posts, aggregated insights, and linked script. Supports editing and script linking.

### ContentPostDetailPanel

**File:** `app/components/contents/ContentPostDetailPanel.tsx`

`SidePanel` showing full details of a single post: thumbnail, caption, platform, published date, and per-post insights.

### CreateGroupPanel

**File:** `app/components/contents/CreateGroupPanel.tsx`

`SidePanel` for creating a new post group. Includes a title input and `PostPicker` to select posts.

### PostPicker

**File:** `app/components/contents/PostPicker.tsx`

Searchable post selector. Uses `useSearchPosts` to find posts by caption within the current project. Used inside `CreateGroupPanel` and when adding posts to an existing group.

### ContentsPlatformFilter

**File:** `app/components/contents/ContentsPlatformFilter.tsx`

Row of platform pills to filter content by platform (Instagram, YouTube, all). Updates `platformFilter` in `useContentsStore`.

## Store

### useContentsStore

**File:** `app/stores/contents/contentsStore.ts`

Zustand store managing Contents page UI state.

| State | Type | Description |
|-------|------|-------------|
| `activeTab` | `'groups' \| 'posts'` | Currently active tab |
| `platformFilter` | `string \| null` | Platform filter (null = all platforms) |
| `selectedGroupUuid` | `string \| null` | UUID of the group shown in the detail panel |
| `selectedPostUuid` | `string \| null` | UUID of the post shown in the detail panel |
| `isCreateGroupPanelOpen` | `boolean` | Whether the create group panel is open |

**Panel mutual exclusion:** setting `selectedGroupUuid` clears `selectedPostUuid` and `isCreateGroupPanelOpen`, and vice versa. Only one panel is visible at a time.

## Hooks

| Hook | File | API Endpoint | Returns |
|------|------|-------------|---------|
| `useListPaginatedPostGroups` | `app/hooks/api/postGroups/useListPaginatedPostGroups.ts` | `GET /api/post-groups` | Paginated `PostGroupWithInsightsAndScriptDTO[]` with infinite scroll (aggregated insights + linked script) |
| `useListPaginatedPosts` | `app/hooks/api/posts/useListPaginatedPosts.ts` | `GET /api/posts` | Paginated `PostWithPlatformAndInsightsDTO[]` with platform info |
| `useSearchPosts` | `app/hooks/api/posts/useSearchPosts.ts` | `GET /api/posts/search` | Posts matching a caption search query |

## DTOs

| File | Description |
|------|-------------|
| `app/dtos/postGroups/PostGroupWithInsightsAndScriptDTO.ts` | Post group with aggregated insights and optional linked script info |
| `app/dtos/posts/PostWithPlatformAndInsightsDTO.ts` | Post with platform identifier and aggregated insights |

## Key Patterns

- **SidePanel for detail views:** all detail and creation views use the shared `SidePanel` component sliding in from the right
- **Platform pills filter:** `ContentsPlatformFilter` provides platform-scoped filtering shared across both tabs
- **Mutual exclusion between panels:** only one side panel can be open at a time (group detail, post detail, or create group), enforced by the store actions
- **Enriched DTOs:** the backend now returns pre-aggregated insights and script info in the list endpoints, avoiding N+1 queries on the frontend
