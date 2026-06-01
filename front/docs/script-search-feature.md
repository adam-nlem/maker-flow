# Script Search Feature (Frontend)

Adds a search bar to the agency Scripts list panel (`ScriptListPanel`) so the user can filter scripts by title. Search is performed server-side over the full paginated dataset — see the matching backend doc.

## Behavior

- Pill-shaped search input at the top of [`ScriptListPanel`](../src/components/agency/scripts/ScriptListPanel.tsx), pinned above the scrollable list.
- 300ms debounce (reuses the existing `SearchBar` debounce).
- `⌘F` (Mac) / `Ctrl+F` (Windows/Linux) focuses the input. The keyboard hint chip on the right of the input flips between `⌘F` and `Ctrl+F` based on the detected platform.
- The search term is **session-only** — cleared on page reload (matches `contentsStore` convention). The status filter persists.

## Components & hooks touched

- [`SearchBar`](../src/components/ui/SearchBar.tsx) — extended with two optional opt-in props (existing `ContentListPanel` usage stays identical):
  - `pill?: boolean` — rounded-full pill style on `bg-clear-3` (matches the agency scripts UI).
  - `focusShortcut?: { key: string; label: string }` — registers a global `keydown` listener and renders a shortcut chip. The `⌘` vs `Ctrl+` prefix is auto-derived from the OS.
  - `placeholder?: string` — overrides the default `searchBar.defaultPlaceholder` translation key.
- [`useIsMac`](../src/hooks/useIsMac.ts) — new SSR-safe hook returning whether the user is on a Mac. Used by `SearchBar` to pick `metaKey` vs `ctrlKey` and the matching label prefix.
- [`useScriptFilterStore`](../src/stores/scripts/scriptFilterStore.ts) — added `searchTerm: string` + `setSearchTerm`. A `partialize` was introduced so only `focusedScriptStatus` persists; `searchTerm` stays transient.
- [`useListPaginatedScripts`](../src/hooks/api/scripts/useListPaginatedScripts.ts) — accepts an optional `searchTerm` prop, threads it into the query key and forwards it as a `searchTerm` query param to `GET /scripts` when truthy.
- [`scriptQueryKeys.list`](../src/hooks/api/scripts/scriptQueryKeys.ts) — includes the optional `searchTerm` to scope React Query caching.
- [`ScriptPageView`](../src/components/agency/scripts/ScriptPageView.tsx) — reads `searchTerm` from `useScriptFilterStore` and passes it as a prop to `useListPaginatedScripts`. Mirrors the established `ContentPostList` / `useListPaginatedPosts` pattern.

## Translations

New key `scripts:searchPlaceholder` added to `src/services/i18n/locales/scripts/{en,fr}.json`.
