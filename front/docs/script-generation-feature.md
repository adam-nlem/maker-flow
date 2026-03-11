# Script Generation Feature — Frontend Documentation

## Overview

The Script Generation feature adds AI-powered script writing to the existing script editor. Users fill a brief (topic, goal, opening style, etc.), optionally configure skill modules, and trigger async generation. The system polls for completion and displays generated parts in the script editor.

**Integration point:** `ScriptEditorPanel` — sparkle icon in `ScriptMetaHeader` toggles the `GenerateScriptPanel` right panel.

---

## Architecture

### Component Tree

```
ScriptPageView
  ├── ScriptListPanel (SidePanel, w-72, left, static)
  ├── ScriptEditorPanel (flex-1)
  │     ├── ScriptMetaHeader
  │     │     └── SparklesIcon button → toggles GenerateScriptPanel via shared store
  │     ├── GenerationHistoryBar (shown when script has generations — navigate between compartments)
  │     ├── GenerationStatusBanner (shown when generation is active)
  │     └── ScriptPartsList (filtered by focusedGenerationUuid)
  ├── GenerateScriptPanel (SidePanel, w-96, right, collapsible — via ScriptRightPanel.Generate)
  │     ├── Creator Profile banner → navigates to /settings
  │     ├── ScriptBriefForm (self-contained: manages own state, onSubmit callback, formId for external submit)
  │     ├── SkillModuleToggles (7 toggleable modules with conditional inputs)
  │     └── Sticky footer with submit button (triggers ScriptBriefForm via formId)
  ├── HookTemplatePanel (SidePanel, w-72, right, collapsible — via ScriptRightPanel.HookTemplates)
  │     ├── Search + category filter (ToggleChip)
  │     ├── HookTemplateCard[] (infinite scroll)
  │     └── CreateHookTemplateModal (via + button)

Settings Page (/settings)
  ├── settings.tsx (thin route — SideBar + delegates to SettingsPageView)
  └── SettingsPageView (flex-row h-screen overflow-hidden — mirrors ScriptPageView)
        ├── SidePanel (w-72, left, static) with nav (SettingsSection enum)
        └── flex-1 overflow-hidden
              ├── GeneralSettings (header px-6 py-5 border-b + placeholder content)
              ├── ProjectSettings (same pattern)
              ├── IntegrationSettings (same pattern)
              ├── CreatorProfileSettings (header + CreatorProfileForm)
              │     └── CreatorProfileForm (flex-col: scrollable fields px-6 py-5 + fixed footer px-6 py-4 border-t)
              └── SubscriptionSettings (same pattern)
```

### File Structure

```
front/app/
├── models/
│   ├── CreatorProfile.ts              ← platforms[], contentType, tones[], signaturePhrases[], neverList[]
│   ├── ScriptGeneration.ts            ← uuid, status, topic, goal, errorMessage, etc.
│   └── enums/
│       ├── ContentType.ts             ← short_form, long_form (toFrenchTranslation map)
│       ├── Tone.ts                    ← 9 values (toFrenchTranslation, bg, text maps) — renamed from VoiceOverType
│       ├── ScriptGoal.ts              ← 6 values (toFrenchTranslation map)
│       ├── OpeningStyle.ts            ← 6 values (toFrenchTranslation map)
│       ├── VideoDuration.ts           ← 7 values (toFrenchTranslation map)
│       ├── ScriptGenerationStatus.ts  ← pending, processing, completed, failed (toFrenchTranslation, bg, text maps)
│       ├── ScriptFormat.ts            ← full_script, outline, hybrid (toFrenchTranslation map)
│       ├── CallToActionType.ts        ← 6 values (toFrenchTranslation map)
│       ├── RetentionCueType.ts        ← 4 values (toFrenchTranslation map)
│       ├── SettingsSection.ts         ← general, creator_profile, project (toFrenchTranslation map)
│       └── SkillModule.ts             ← 7 modules (toFrenchTranslation, description, hasExtraInput, extraInputType maps)
├── hooks/api/
│   ├── creatorProfiles/
│   │   ├── creatorProfileQueryKeys.ts
│   │   ├── useShowCreatorProfile.ts   ← GET, returns null on 404
│   │   └── useCreateOrUpdateCreatorProfile.ts  ← POST, upsert pattern
│   └── scriptGenerations/
│       ├── scriptGenerationQueryKeys.ts
│       ├── useCreateScriptGeneration.ts  ← POST, returns ScriptGeneration
│       ├── useUpdateScriptGeneration.ts  ← PATCH /{uuid}, resets + re-dispatches existing generation
│       ├── useDeleteScriptGeneration.ts  ← DELETE /{uuid}, removes generation and its parts
│       ├── useListScriptGenerations.ts   ← GET, returns ScriptGeneration[] (all generations for a script)
│       ├── useLatestScriptGeneration.ts  ← derives from useListScriptGenerations (first item)
│       └── useShowScriptGeneration.ts    ← GET with polling (refetchInterval: 2s)
├── stores/scripts/
│   ├── scriptGenerationStore.ts       ← activeGenerationUuid + focusedGenerationUuid state
│   └── scriptRightPanelStore.ts       ← right panel state (ScriptRightPanel.Generate, ScriptRightPanel.HookTemplates)
├── components/scripts/
│   ├── generation/
│   │   ├── GenerateScriptPanel.tsx     ← collapsible right panel with brief + skills
│   │   ├── ScriptBriefForm.tsx         ← self-contained brief form (internal state, onSubmit, optional formId)
│   │   ├── SkillModuleToggles.tsx      ← skill module toggles with conditional inputs
│   │   ├── GenerationStatusBanner.tsx  ← inline status banner with auto-dismiss
│   │   └── GenerationHistoryBar.tsx    ← horizontal bar to navigate between generation compartments
│   └── creatorProfile/
│       └── CreatorProfileForm.tsx      ← full creator profile form (used in Settings page)
├── components/settings/
│   ├── SettingsPageView.tsx            ← view component (mirrors ScriptPageView layout)
│   ├── GeneralSettings.tsx             ← placeholder (header + content pattern)
│   ├── ProjectSettings.tsx             ← placeholder (header + content pattern)
│   ├── IntegrationSettings.tsx         ← placeholder (header + content pattern)
│   ├── SubscriptionSettings.tsx        ← placeholder (header + content pattern)
│   └── CreatorProfileSettings.tsx      ← header + delegates to CreatorProfileForm
└── routes/
    └── settings.tsx                    ← thin route (SideBar + SettingsPageView)
```

---

## Key Patterns

### Generation Flow

1. User clicks sparkle icon in `ScriptMetaHeader` → toggles `GenerateScriptPanel` via shared `scriptRightPanelStore`
2. User fills brief (topic required, goal required, opening style required, duration required)
3. User optionally toggles skill modules and configures extra inputs (CTA type, retention cue type, etc.)
4. User clicks "Générer le script" → if `focusedGenerationUuid` is set, `useUpdateScriptGeneration` fires (PATCH — resets and re-dispatches the existing generation); otherwise `useCreateScriptGeneration` fires (POST — creates a new one)
5. On success, `activeGenerationUuid` is stored in `scriptGenerationStore`
6. Panel closes, `GenerationStatusBanner` appears in the editor
7. `useShowScriptGeneration` polls every 2 seconds while status is `pending` or `processing`
8. On `completed` → invalidates generation-scoped `scriptQueryKeys.parts(scriptUuid, generationUuid)` + `scriptGenerationQueryKeys.list(scriptUuid)` → parts list re-fetches → `focusedGenerationUuid` is switched to the newly completed generation → banner auto-dismisses after 3 seconds
9. On `failed` → banner shows error message with dismiss button

### Generation Compartments (History Navigation)

Each generation creates an isolated compartment of parts with independent positions. Users navigate between compartments via the `GenerationHistoryBar`.

- **Default view on script open:** latest completed generation (fallback to manual parts if none)
- **"Manuel" chip:** shows manually created parts (`generationUuid = undefined`)
- **Generation chips:** each shows a truncated topic + status color dot (yellow=pending, blue=processing, green=completed, red=failed)
- **Adding a manual part:** the part is created in the currently viewed compartment (generation or manual)
- **State management:** `focusedGenerationUuid` in `scriptGenerationStore` drives which compartment is displayed
- **On generation completion:** `GenerationStatusBanner` automatically switches `focusedGenerationUuid` to the newly completed generation

### Shared Right Panel Store

`useScriptRightPanelStore` manages the right panel state. Only one panel can be open at a time. Used by both `GenerateScriptPanel` (`ScriptRightPanel.Generate`) and `HookTemplatePanel` (`ScriptRightPanel.HookTemplates`).

```ts
// scriptRightPanelStore.ts — uses ScriptRightPanel enum (~/models/enums/ScriptRightPanel)
{
    activePanel: ScriptRightPanel | null   // ScriptRightPanel.Generate | ScriptRightPanel.HookTemplates
    openPanel: (panel: ScriptRightPanel) => void
    closePanel: () => void
    togglePanel: (panel: ScriptRightPanel) => void  // toggle: if same panel → close, else → open
}
```

Persistence key: `"app:scripts:right-panel"`

### Polling Strategy

`useShowScriptGeneration` uses React Query's `refetchInterval` callback:
- Returns `2000` (ms) when status is `pending` or `processing`
- Returns `false` to stop polling when status is `completed` or `failed`
- On completion, automatically invalidates `scriptQueryKeys.parts(scriptUuid, generationUuid)` and `scriptGenerationQueryKeys.list(scriptUuid)` to refresh the parts list and generation list

### Creator Profile

- Creator Profile form lives in the **Settings page** (`/settings`, creator profile section)
- `GenerateScriptPanel` shows a banner that navigates to `/settings` for profile configuration
- `CreatorProfileForm` uses upsert pattern — same form for create and update
- Form layout follows the ScriptPartsList pattern: scrollable fields (`flex-1 overflow-y-auto px-6 py-5`) + fixed footer (`px-6 py-4 border-t`) for save button
- Dynamic array inputs for `signaturePhrases` and `neverList` (add with Enter or +, remove with ×)
- Multi-select `ToggleChip` for `platforms` and `tones`

### Skill Modules

7 toggleable modules in `SkillModuleToggles`:

| Module | Extra Input | Input Type |
|--------|-------------|------------|
| Strong Hook | No | — |
| Retention Boosters | Yes | ToggleChip select (RetentionCueType enum: question/teaser/pattern_break/cliffhanger) |
| Storytelling Mode | Yes | TextArea (personal story) |
| SEO Optimization | Yes | Input (target keyword) |
| Script Format | Yes | ToggleChip select (ScriptFormat enum: full_script/outline/hybrid) |
| B-Roll Cues | No | — |
| Call to Action | Yes | ToggleChip select (CallToActionType enum: subscribe/like/comment/share/link/custom) + Input for custom CTA text (shown only when "custom" is selected) |

Each module renders as a card with a radio-style toggle indicator. Active modules show a primary border/background. Conditional extra inputs appear below the module when active.

---

## Data Interfaces

### Models

**CreatorProfile:**
```ts
class CreatorProfile {
    uuid: string
    platforms: Platform[]
    contentType: ContentType | undefined
    niche: string | undefined
    targetAudience: string | undefined
    tones: Tone[]
    signaturePhrases: string[]
    neverList: string[]
    styleSample: string | undefined
    createdAt: Date
    updatedAt?: Date
}
```

**ScriptGeneration:**
```ts
class ScriptGeneration {
    uuid: string
    status: ScriptGenerationStatus
    topic: string
    goal: ScriptGoal
    keyPoints: string | undefined
    openingStyle: OpeningStyle
    duration: VideoDuration
    callToAction: string | undefined
    extraContext: string | undefined
    activeSkills: string[]
    skillInputs: Record<string, string>
    errorMessage: string | undefined
    createdAt: Date
    completedAt?: Date
}
```

### Query Keys

```ts
creatorProfileQueryKeys.all                    // ['creatorProfiles']
creatorProfileQueryKeys.show(projectUuid)      // ['creatorProfiles', 'show', projectUuid]

scriptGenerationQueryKeys.all                  // ['scriptGenerations']
scriptGenerationQueryKeys.list(scriptUuid)     // ['scriptGenerations', 'list', scriptUuid]
scriptGenerationQueryKeys.show(generationUuid) // ['scriptGenerations', 'show', generationUuid]
```

### Stores

```ts
// scriptGenerationStore.ts
{
    activeGenerationUuid: string | null           // currently processing generation (for polling)
    focusedGenerationUuid: string | undefined     // viewed generation compartment (undefined = manual parts)
    setActiveGenerationUuid: (uuid: string | null) => void
    clearActiveGeneration: () => void
    setFocusedGenerationUuid: (uuid: string | undefined) => void
}

// scriptRightPanelStore.ts — uses ScriptRightPanel enum
{
    activePanel: ScriptRightPanel | null   // ScriptRightPanel.Generate | ScriptRightPanel.HookTemplates
    openPanel: (panel: ScriptRightPanel) => void
    closePanel: () => void
    togglePanel: (panel: ScriptRightPanel) => void
}
```

---

## Component Props

### ScriptBriefForm

Self-contained form component that manages its own state internally. Exports `ScriptBriefValues` type.

| Prop | Type | Description |
|------|------|-------------|
| `initialValues` | `Partial<ScriptBriefValues>` | Optional initial values (for pre-filling from existing generation) |
| `onSubmit` | `(values: ScriptBriefValues) => void` | Called with validated values on form submit |
| `isPending` | `boolean` | Shows loading state on submit button |
| `submitLabel` | `string` (optional) | Button text. If omitted, no submit button is rendered (use `formId` for external trigger) |
| `submitIcon` | `React.ComponentType` (optional) | Icon component for the submit button |
| `formId` | `string` (optional) | HTML form id for external submit trigger via `form.requestSubmit()` |

**Usage patterns:**
- **OnboardingGenerateScriptStep:** uses `submitLabel` + `submitIcon` (button inside form)
- **GenerateScriptPanel:** uses `formId` (external button in SidePanel sticky footer), `key={generation?.uuid}` for re-mount on generation change

### GenerateScriptPanel

| Prop | Type | Description |
|------|------|-------------|
| `scriptUuid` | `string` | Target script for generation |
| `projectUuid` | `string` | Project UUID for creator profile |

Reads `activePanel` from `useScriptRightPanelStore` internally. Pre-fills form fields via `ScriptBriefForm`'s `initialValues` prop (keyed by `focusedGeneration?.uuid` for re-mount). When updating an existing generation (i.e. `focusedGenerationUuid` is set), a `ConfirmDeleteDialog` is shown before proceeding, warning the user that the previously generated script will be deleted.

### GenerationHistoryBar

| Prop | Type | Description |
|------|------|-------------|
| `scriptUuid` | `string` | Script UUID to fetch generations |
| `selectedGenerationUuid` | `string \| undefined` | Currently focused generation (undefined = manual) |
| `onSelectGeneration` | `(uuid: string \| undefined) => void` | Callback to switch compartment |

Horizontal bar with "Manuel" chip + one chip per generation. Each generation chip shows a status color dot and truncated topic. Only rendered when the script has at least one generation.

### GenerationStatusBanner

| Prop | Type | Description |
|------|------|-------------|
| `scriptUuid` | `string` | Script UUID for polling invalidation |

Reads `activeGenerationUuid` from `scriptGenerationStore` internally. On completion, switches `focusedGenerationUuid` to the newly completed generation.
