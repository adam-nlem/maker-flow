# Script Generation Feature — Frontend Documentation

## Overview

The Script Generation feature adds AI-powered script writing to the existing script editor. Users fill a brief (topic, goal, opening style, etc.), optionally configure skill modules, and trigger async generation. The system polls for completion and displays generated parts in the script editor.

**Integration point:** `ScriptEditorPanel` — sparkle icon in `ScriptMetaHeader` opens the generation modal.

---

## Architecture

### Component Tree

```
ScriptEditorPanel
  ├── ScriptMetaHeader
  │     └── SparklesIcon button → opens GenerateScriptModal
  ├── GenerationStatusBanner (shown when generation is active)
  ├── GenerateScriptModal (portal via ModalOverlay)
  │     ├── Creator Profile banner → navigates to /settings (creator profile section)
  │     ├── ScriptBriefForm (topic, goal, key points, opening style, duration, CTA, extra context)
  │     ├── SkillModuleToggles (6 toggleable modules with conditional inputs)
  │     └── Replace existing toggle (shown only if script has parts)
  └── [existing] ScriptPartsList

Settings Page (/settings)
  ├── Left nav (SettingsSection enum: General, CreatorProfile, Project)
  └── Right content
        ├── GeneralSettings (placeholder)
        ├── CreatorProfileSettings → CreatorProfileForm
        └── ProjectSettings (placeholder)
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
│       └── useShowScriptGeneration.ts    ← GET with polling (refetchInterval: 2s)
├── stores/scripts/
│   └── scriptGenerationStore.ts       ← activeGenerationUuid state
├── components/scripts/
│   ├── generation/
│   │   ├── GenerateScriptModal.tsx     ← main modal with brief + skills + replace toggle
│   │   ├── ScriptBriefForm.tsx         ← per-generation brief fields
│   │   ├── SkillModuleToggles.tsx      ← skill module toggles with conditional inputs
│   │   └── GenerationStatusBanner.tsx  ← inline status banner with auto-dismiss
│   └── creatorProfile/
│       └── CreatorProfileForm.tsx      ← full creator profile form (used in Settings page)
├── components/settings/
│   ├── GeneralSettings.tsx             ← placeholder
│   ├── CreatorProfileSettings.tsx      ← wraps CreatorProfileForm
│   └── ProjectSettings.tsx             ← placeholder
└── routes/
    └── settings.tsx                    ← settings page with sidebar + content layout
```

---

## Key Patterns

### Generation Flow

1. User clicks sparkle icon in `ScriptMetaHeader` → opens `GenerateScriptModal`
2. User fills brief (topic required, goal required, opening style required, duration required)
3. User optionally toggles skill modules and configures extra inputs
4. User optionally checks "Replace existing content" (shown only if script has parts)
5. User clicks "Générer le script" → `useCreateScriptGeneration` fires
6. On success, `activeGenerationUuid` is stored in `scriptGenerationStore`
7. Modal closes, `GenerationStatusBanner` appears in the editor
8. `useShowScriptGeneration` polls every 2 seconds while status is `pending` or `processing`
9. On `completed` → invalidates `scriptQueryKeys.parts(scriptUuid)` → parts list re-fetches → banner auto-dismisses after 3 seconds
10. On `failed` → banner shows error message with dismiss button

### Polling Strategy

`useShowScriptGeneration` uses React Query's `refetchInterval` callback:
- Returns `2000` (ms) when status is `pending` or `processing`
- Returns `false` to stop polling when status is `completed` or `failed`
- On completion, automatically invalidates `scriptQueryKeys.parts(scriptUuid)` to refresh the parts list

### Creator Profile

- Creator Profile form lives in the **Settings page** (`/settings`, creator profile section)
- `GenerateScriptModal` shows a banner that navigates to `/settings` for profile configuration
- `CreatorProfileForm` uses upsert pattern — same form for create and update
- Dynamic array inputs for `signaturePhrases` and `neverList` (add with Enter or +, remove with ×)
- Multi-select `ToggleChip` for `platforms` and `tones`

### Skill Modules

7 toggleable modules in `SkillModuleToggles`:

| Module | Extra Input | Input Type |
|--------|-------------|------------|
| Strong Hook | No | — |
| Retention Boosters | No | — |
| Storytelling Mode | Yes | TextArea (personal story) |
| SEO Optimization | Yes | Input (target keyword) |
| Script Format | Yes | ToggleChip select (ScriptFormat enum: full_script/outline/hybrid) |
| B-Roll Cues | No | — |
| Call to Action | No | — |

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
    replaceExisting: boolean
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
scriptGenerationQueryKeys.show(generationUuid) // ['scriptGenerations', 'show', generationUuid]
```

### Store

```ts
// scriptGenerationStore.ts
{
    activeGenerationUuid: string | null
    setActiveGenerationUuid: (uuid: string | null) => void
    clearActiveGeneration: () => void
}
```

---

## Component Props

### GenerateScriptModal

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Close handler |
| `scriptUuid` | `string` | Target script for generation |
| `projectUuid` | `string` | Project UUID for creator profile |
| `hasExistingParts` | `boolean` | Shows replace toggle when true |

### GenerationStatusBanner

| Prop | Type | Description |
|------|------|-------------|
| `scriptUuid` | `string` | Script UUID for polling invalidation |

Reads `activeGenerationUuid` from `scriptGenerationStore` internally.
