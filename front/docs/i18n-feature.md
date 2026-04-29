# i18n Feature - Frontend Documentation

## Overview

Internationalization is provided by [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/), with `i18next-browser-languagedetector` resolving the active locale from `localStorage` (cache key `makerflow-language`) with a fallback chain `localStorage → navigator → fr`.

French (`fr`) is the **source / default** language. English (`en`) is added as a translated locale. New copy is authored in French first, then translated to English.

The current state is **infrastructure + pilot**: only the sidebar (`NavigationItem`) and the API error toasts (`errorCodeMessages.ts`) consume the i18n system today. The remaining ~100+ components still hold hardcoded French strings and are migrated gradually in follow-up PRs (see "Migrating a feature" below).

## Architecture

```
front/src/services/i18n/
├── i18n.ts                 # i18next.init(...) — singleton, side-effect import in main.tsx
└── locales/
    ├── common/             # generic words (actions, labels) used across features
    │   ├── fr.json
    │   └── en.json
    ├── navigation/         # sidebar items
    │   ├── fr.json
    │   └── en.json
    └── errors/             # API error code translations (one key per backend numeric code)
        ├── fr.json
        └── en.json
```

```
front/src/hooks/
└── useChangeLanguage.ts    # change locale + update <html lang>; also exposes currentLanguage

front/src/models/enums/
└── Language.ts             # Language enum + languageToLabel (self-labelling: Français / English)

front/src/components/settings/
└── LanguageSwitcher.tsx    # the in-app language picker, mounted inside GeneralSettings
```

The locales are organised **feature-folder-first** (one folder per domain, with `fr.json` and `en.json` inside), to mirror the rest of the codebase (`components/auth/`, `stores/contents/`, etc.). Adding a new translated feature = drop a new `locales/<feature>/` folder and register it in [`i18n.ts`](../src/services/i18n/i18n.ts) — no edits in two parallel locale trees.

## Key naming convention

- Dot-nested camelCase: `navigation.items.home`, `errors.project.notFound`, `common.actions.save`.
- Always use the explicit namespace prefix when calling `t()` outside the default namespace: `t("navigation:items.home")`, `t("errors:project.notFound")`. The default namespace is `common`, so `t("actions.save")` works without a prefix.
- Feature folder name = namespace name. Don't introduce one-off namespaces.

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

## Migrating a feature

The two example migrations to copy from:

### Pattern A — an enum's translation record

Before (typical existing pattern):

```ts
// models/enums/NavigationItem.ts
export const navigationItemToFrenchTranslation: Record<NavigationItem, string> = {
    [NavigationItem.Home]: "Accueil",
    ...
};
```

After:

1. Replace the record with translation **keys**:
   ```ts
   export const navigationItemTranslationKeys: Record<NavigationItem, string> = {
       [NavigationItem.Home]: "navigation:items.home",
       ...
   };
   ```
2. Add the strings to the locale files (create the namespace folder if it doesn't exist):
   ```json
   // services/i18n/locales/navigation/fr.json
   { "items": { "home": "Accueil", ... } }
   // services/i18n/locales/navigation/en.json
   { "items": { "home": "Home", ... } }
   ```
3. Register the namespace in [`i18n.ts`](../src/services/i18n/i18n.ts):
   ```ts
   import navigationFr from "./locales/navigation/fr.json";
   import navigationEn from "./locales/navigation/en.json";

   resources: {
       fr: { ..., navigation: navigationFr },
       en: { ..., navigation: navigationEn },
   },
   ns: ["common", "navigation", "errors"],
   ```
4. Update each consumer to call `t(navigationItemTranslationKeys[item])` instead of indexing the old record.

If a non-React utility (e.g., [`navigationHelpers.ts`](../src/utils/navigationHelpers.ts)) used to return the translated label, return the translation **key** instead and let the caller run it through `t()`.

### Pattern B — `Record<number, string>` lookup table

The migration of [`errorCodeMessages.ts`](../src/services/apiErrorHandler/errorCodeMessages.ts) is the reference. The export shape changed from `errorCodeMessages: Record<number, string>` (with French strings inline) to `errorCodeKeys: Record<number, string>` (with i18n key strings), and `resolveErrorMessage()` now calls `i18n.t(key)`.

### Pattern C — hardcoded JSX copy

For literal strings inside components, just replace `"Some French text"` with `t("namespace:some.key")` after adding the key to the relevant locale files. If the component is not yet using `useTranslation`, add the hook.

## Adding a new locale

1. Add the value to the [`Language` enum](../src/models/enums/Language.ts) and `languageToLabel`.
2. For each existing namespace in `services/i18n/locales/<namespace>/`, add a `<lang>.json` file with the same keys.
3. Add the imports + a top-level entry to the `resources` object in [`i18n.ts`](../src/services/i18n/i18n.ts).
4. Add the locale to `supportedLngs`.

## Why no backend i18n yet

The Symfony backend doesn't return user-facing strings — its [structured exception system](exception-system.md) emits numeric error codes (`{ "code": 17001 }`) that the frontend resolves to localized messages via the `errors` namespace described above. So there's no API surface that benefits from Symfony's translation component today.

The remaining backend user-facing surface is **email content** (Resend templates rendered server-side in workers). Adding Symfony i18n there will require a way to know each recipient's language, which depends on persisting `language` on the `User` entity — explicitly out of scope of the current setup.

## What's still in French

The pilot covers only the sidebar and API error toasts. Everything else is hardcoded French and is migrated incrementally:

- ~14-19 enum translation maps in [`front/src/models/enums/`](../src/models/enums/) following the `xxxToFrenchTranslation` pattern (e.g., `ProjectType`, `OnboardingStep`, `AiModel`, `SettingsSection`, `TodoListPriority`, etc.).
- ~100+ components with hardcoded French JSX (auth forms, project modals, insights cards, settings sub-pages, etc.).
- Validation messages in [`front/src/utils/registerValidation.ts`](../src/utils/registerValidation.ts), [`passwordValidation.ts`](../src/utils/passwordValidation.ts).
- Date/duration formatter fallback strings in [`dateFormatters.ts`](../src/utils/dateFormatters.ts), [`durationFormatters.ts`](../src/utils/durationFormatters.ts).

Each future PR migrates one feature/enum at a time using the patterns above.
