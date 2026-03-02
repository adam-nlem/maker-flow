# Frontend Documentation

Index of all available documentation for the frontend codebase (React, TypeScript, Tailwind).

## Documentation Index

| File | Description | Scope |
|------|-------------|-------|
| [coding-style.md](coding-style.md) | Coding standards and conventions | Project structure, naming conventions, component patterns, models, DTOs, enums, API hooks (React Query), Zustand stores, HTTP client, routes, styling, form handling, global API error handling (MutationCache, toast store), best practices |
| [data-table.md](data-table.md) | DataTable component | Generic reusable table with column definitions, render functions, row click, sticky headers, `afterTable` slot for infinite scroll |
| [integration-oauth-feature.md](integration-oauth-feature.md) | OAuth integration system | OAuth popup flow, hooks (`useCreateIntegration`, `useOAuthPopup`, `useOAuthMessageListener`), callback route, security validation, error handling, adding new providers |
| [project-feature.md](project-feature.md) | Project management feature | Project model, `ProjectType` enum, CRUD hooks, Zustand stores (`useFocusProjectStore`, modal stores), UI components (`CreateProjectModal`, `UpdateProjectModal`, `ProjectTile`), sidebar integration |
| [select-dropdown.md](select-dropdown.md) | SelectDropdown component | Props documentation, `renderTrigger` / `renderItem` callbacks, entity selection pattern (with create button), enum/filter selection pattern |
| [insights-feature.md](insights-feature.md) | Insights feature | Page layout chain (viewport-filling flex layout), components, post detail page with timeline charts, Zustand filter store, API hooks, sticky table headers |
| [dark-mode-feature.md](dark-mode-feature.md) | Dark/light theme system | CSS variable overrides (`:root.dark`), theme Zustand store, anti-flash script, sidebar toggle, rules for theme-aware components |
| [ui-style-guidelines.md](ui-style-guidelines.md) | Design system and UI guidelines | Fonts (Outfit, Roboto), typography classes, color palette (light + dark), common patterns (borders, shadows, focus/hover states), 40+ UI components catalog, utility classes, Heroicons v2 |
| [script-feature.md](script-feature.md) | Script feature | Split-view editor, ScriptPart discriminated union, DnD reordering, inline editing pattern, tag management, dialogue subjects, query key conventions, hook interface gotchas |
| [script-generation-feature.md](script-generation-feature.md) | AI script generation | GenerateScriptModal, ScriptBriefForm, SkillModuleToggles, CreatorProfileForm, GenerationStatusBanner, polling strategy, Zustand store, React Query hooks, 6 new enums |
| [hook-template-feature.md](hook-template-feature.md) | Hook template library | HookTemplate model, HookTemplatePanel, HookTemplateCard, ApplyHookTemplateModal, CreateHookTemplateModal, HookContentRenderer, placeholder system, ScriptHook.hookTemplate integration |
| [billing-feature.md](billing-feature.md) | Billing & subscription UI | Settings sub-routing (dynamic `:section` param), SubscriptionPlan/SubscriptionStatus enums, CreditBalance/Subscription models, PlanConfig (hardcoded prices/features), API hooks (balance, subscription, checkout), subscription page components (CreditBalanceCard, CurrentSubscriptionCard, PlanSelector, PlanCard), Stripe Checkout redirect flow, `formatPriceEur` utility |
