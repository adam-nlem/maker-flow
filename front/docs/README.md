# Frontend Documentation

Index of all available documentation for the frontend codebase (React, TypeScript, Tailwind).

## Documentation Index

| File | Description | Scope |
|------|-------------|-------|
| [coding-style.md](coding-style.md) | Coding standards and conventions | Project structure, naming conventions, component patterns, models, DTOs, enums, API hooks (React Query), Zustand stores, HTTP client, routes, styling, form handling, module registry pattern, global API error handling (MutationCache, toast store), best practices |
| [data-table.md](data-table.md) | DataTable component | Generic reusable table with column definitions, render functions, row click, sticky headers, `afterTable` slot for infinite scroll |
| [integration-oauth-feature.md](integration-oauth-feature.md) | OAuth integration system | OAuth popup flow, hooks (`useCreateIntegration`, `useOAuthPopup`, `useOAuthMessageListener`), callback route, security validation, error handling, adding new providers |
| [module-usermodule-feature.md](module-usermodule-feature.md) | Module system architecture | Module templates vs UserModule instances, `ModuleIdentifier` and `ModuleSize` enums, module registry, dashboard rendering flow, widget entry point pattern, API hooks |
| [project-feature.md](project-feature.md) | Project management feature | Project model, `ProjectType` enum, CRUD hooks, Zustand stores (`useFocusProjectStore`, modal stores), UI components (`CreateProjectModal`, `UpdateProjectModal`, `ProjectTile`), sidebar integration |
| [select-dropdown.md](select-dropdown.md) | SelectDropdown component | Props documentation, `renderTrigger` / `renderItem` callbacks, entity selection pattern (with create button), enum/filter selection pattern |
| [social-analytics-feature.md](social-analytics-feature.md) | Social Analytics module | Page layout chain (viewport-filling flex layout), components, post detail page with timeline charts, Zustand filter store, API hooks, sticky table headers |
| [dark-mode-feature.md](dark-mode-feature.md) | Dark/light theme system | CSS variable overrides (`:root.dark`), theme Zustand store, anti-flash script, sidebar toggle, rules for theme-aware components |
| [ui-style-guidelines.md](ui-style-guidelines.md) | Design system and UI guidelines | Fonts (Outfit, Roboto), typography classes, color palette (light + dark), common patterns (borders, shadows, focus/hover states), 40+ UI components catalog, utility classes, Heroicons v2 |
