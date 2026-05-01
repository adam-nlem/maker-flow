# i18n Feature - Frontend Documentation

## Overview

Internationalization is provided by [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/), with `i18next-browser-languagedetector` resolving the active locale from `localStorage` (cache key `makerflow-language`) with a fallback chain `localStorage → navigator → fr`.

French (`fr`) is the **source / default** language. English (`en`) is added as a translated locale. New copy is authored in French first, then translated to English.

The whole frontend has been migrated. **The only files that still hold hardcoded French are [`routes/privacy-policy.tsx`](../src/routes/privacy-policy.tsx) and [`routes/terms-of-service.tsx`](../src/routes/terms-of-service.tsx)** (~180 lines of legal content each, deferred to a dedicated PR). Every other component, enum translation map, validation utility, and route renders fully through `t()`.

## Architecture

```
front/src/services/i18n/
├── i18n.ts                  # i18next.init(...) — singleton, side-effect import in main.tsx
└── locales/
    ├── common/              # cross-cutting (actions, language label, legal links, search bar, etc.)
    ├── navigation/          # sidebar nav items
    ├── errors/              # API error code translations (one key per backend numeric code)
    ├── settings/            # settings page (general / projects / subscription)
    ├── sidebar/             # sidebar-specific labels (create project, premium CTA, …)
    ├── auth/                # login / register / verify-otp + form validation messages
    ├── onboarding/          # onboarding step strings + generating phase + first script title
    ├── welcome/             # welcome flow features + how-it-works
    ├── prelaunch/           # prelaunch landing + dashboard + reward tiers
    ├── projects/            # create/update project modals
    ├── tasks/               # todo lists + tasks + tags
    ├── contents/            # contents page (post & group panels) + page header
    ├── home/                # home dashboard (overview, scripts panel, rankings)
    ├── scripts/             # scripts panel + meta + parts + chat + hooks + calendar filters
    ├── integrations/        # integration login card + placeholder + OAuth errors
    └── enums/               # all 38 enum translation maps (one section per enum)
```

```
front/src/hooks/
└── useChangeLanguage.ts     # change locale + update <html lang>; also exposes currentLanguage

front/src/models/enums/
└── Language.ts              # Language enum + languageToLabel (self-labelling: Français / English)

front/src/components/settings/
└── LanguageSwitcher.tsx     # in-app language picker, mounted inside GeneralSettings
```

The locales are organised **feature-folder-first** (one folder per domain, with `fr.json` and `en.json` inside), to mirror the rest of the codebase (`components/auth/`, `stores/contents/`, etc.). Adding a new translated feature = drop a new `locales/<feature>/` folder and register it in [`i18n.ts`](../src/services/i18n/i18n.ts) — no edits in two parallel locale trees.

There are **16 namespaces** today: `common, navigation, errors, settings, sidebar, auth, onboarding, welcome, prelaunch, projects, tasks, contents, home, scripts, integrations, enums`.

## Key naming convention

- Dot-nested camelCase: `navigation.items.home`, `errors.project.notFound`, `enums.aiModel.names.gemini`.
- **Always prefix with the namespace** when calling `t()` outside the default namespace: `t("navigation:items.home")`, `t("errors:project.notFound")`. The default namespace is `common`, so `t("actions.save")` works without a prefix.
- Feature folder name = namespace name. The single exception is `enums`, which centralizes all enum translations under one namespace with a sub-key per enum (`enums:aiModel.names.gemini`, `enums:scriptStatus.idea`, `enums:projectType.contentCreation`, …).

## Usage

### In a React component

```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
    const { t } = useTranslation();
    return <button>{t("actions.save")}</button>;
}
```

### Outside React (utilities, services)

Import the singleton directly:

```ts
import i18n from "~/services/i18n/i18n";

export function describeError(code: number): string {
    return i18n.t("errors:fallback");
}
```

This is how [`resolveErrorMessage`](../src/services/apiErrorHandler/errorCodeMessages.ts) works — toasts dispatched from the global mutation handler need a string outside React's render cycle.

### Switching languages programmatically

```tsx
import { useChangeLanguage } from "~/hooks/useChangeLanguage";

const { currentLanguage, changeLanguage } = useChangeLanguage();
changeLanguage(Language.En);
```

`useChangeLanguage` updates the i18next instance (which auto-persists to `localStorage` via the language detector) and sets `document.documentElement.lang` for accessibility.

## Migrating a feature (for future strings)

### Pattern A — an enum's translation record

Every existing enum already follows this pattern. The companion map is named `xxxTranslationKeys` (or `xxxLabelKeys` / `xxxDescriptionKeys` / `xxxShortLabelKeys` for enums that expose multiple translation faces, like `aiModel`, `onboardingStep`, `prelaunchRewardTier`, `skillModule`).

```ts
// models/enums/NavigationItem.ts
export const navigationItemTranslationKeys: Record<NavigationItem, string> = {
    [NavigationItem.Home]: "navigation:items.home",
    ...
};
```

To add a new enum: declare the map, add the strings under the matching `enums:<enumName>.…` (or feature-specific) sub-tree in `locales/enums/{fr,en}.json`, and consume via `t(navigationItemTranslationKeys[item])`.

### Pattern B — `Record<number, string>` lookup table

The migration of [`errorCodeMessages.ts`](../src/services/apiErrorHandler/errorCodeMessages.ts) is the reference. The export shape is `errorCodeKeys: Record<number, string>` (i18n key per code), and `resolveErrorMessage()` calls `i18n.t(key)`.

### Pattern C — hardcoded JSX copy

For literal strings inside components, just replace `"Some French text"` with `t("namespace:some.key")` after adding the key to the relevant locale files. If the component is not yet using `useTranslation`, add the hook.

### Pattern D — interpolation

i18next supports `{{var}}` placeholders:

```json
{ "createdAt": "Créé le {{date}}" }
```

```tsx
t("projects:tile.createdAt", { date: formatToFrenchDateShort(project.createdAt) })
```

Pluralization uses i18next's `_one` / `_other` suffix (see `contents:selectedCount_one` / `contents:selectedCount_other`).

## Adding a new locale

1. Add the value to the [`Language` enum](../src/models/enums/Language.ts) and `languageToLabel`.
2. For each existing namespace in `services/i18n/locales/<namespace>/`, add a `<lang>.json` file with the same keys.
3. Add the imports + a top-level entry to the `resources` object in [`i18n.ts`](../src/services/i18n/i18n.ts).
4. Add the locale to `supportedLngs`.

## Why no backend i18n

The Symfony backend doesn't return user-facing strings — its [structured exception system](exception-system.md) emits numeric error codes (`{ "code": 17001 }`) that the frontend resolves to localized messages via the `errors` namespace. No API surface benefits from Symfony's translation component today.

The remaining backend user-facing surface is **email content** (Resend templates rendered server-side in workers). Adding Symfony i18n there will require a way to know each recipient's language, which depends on persisting `language` on the `User` entity — out of scope of this work.

## What's still in French (deferred follow-ups)

- [`routes/privacy-policy.tsx`](../src/routes/privacy-policy.tsx) — ~80 lines of legal content
- [`routes/terms-of-service.tsx`](../src/routes/terms-of-service.tsx) — ~100 lines of legal content
- The `'fr-FR'` locale literal passed to `Date.prototype.toLocaleDateString/toLocaleTimeString` and to `Number.prototype.toLocaleString` in a handful of components — these still format dates/numbers as French. Wiring them to the active i18n locale (`i18n.language === 'en' ? 'en-US' : 'fr-FR'`) is a future polish pass.
- The `MONTHS_FR` / `DAYS_FR_FULL` constants in [`utils/dateHelpers.ts`](../src/utils/dateHelpers.ts) used by `ScriptCalendar`. Since these are calendar labels (not free-form copy), localizing them properly is best done by switching to `Intl.DateTimeFormat(i18n.language, ...)` rather than hand-curated month arrays.
