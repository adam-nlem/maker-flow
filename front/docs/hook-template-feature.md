# Hook Template Feature - Frontend Documentation

## Overview

The Hook Template feature provides a reusable library of video hook templates. Users can browse public and private templates from a toggleable right panel in the script editor, then apply a template to their script's hook field. Applying a template copies the template content into the hook text and links the template reference to the script.

---

## Model

### `HookTemplate` (`~/models/HookTemplate.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string` | Unique identifier |
| `title` | `string` | Template name |
| `content` | `string` | Template text with `[placeholder]` tokens |
| `isPublic` | `boolean` | If true, visible to all users |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date \| undefined` | Last update timestamp |

### `Script` Model Update (`~/models/Script.ts`)

Added optional `hookTemplate` field (`HookTemplate | undefined`). When a template is applied, this field references the source template.

---

## React Query Hooks

**Location:** `~/hooks/api/hookTemplates/`

### Query Keys (`hookTemplateQueryKeys.ts`)

```ts
hookTemplateQueryKeys.all        // ['hookTemplates']
hookTemplateQueryKeys.list(term) // ['hookTemplates', 'list', term ?? '']
```

### Hooks

| Hook | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `useListHookTemplates` | GET | `/hook-templates` | List all accessible templates, optional `searchTerm` |
| `useCreateHookTemplate` | POST | `/hook-templates` | Create a new template (`title`, `content`, `isPublic?`) |
| `useUpdateHookTemplate` | PATCH | `/hook-templates/{uuid}` | Update own template |
| `useDeleteHookTemplate` | DELETE | `/hook-templates/{uuid}` | Delete own template |

All mutation hooks invalidate `hookTemplateQueryKeys.all` on success.

### `useUpdateScript` Update (`~/hooks/api/scripts/useUpdateScript.ts`)

Added `hookTemplateUuid?: string | null` to `UpdateScriptData` to support linking/unlinking templates from scripts.

---

## Zustand Store

### `useHookTemplatePanelStore` (`~/stores/scripts/hookTemplatePanelStore.ts`)

Persisted store controlling the right panel visibility.

| Field | Type | Description |
|-------|------|-------------|
| `isOpen` | `boolean` | Panel visibility state |
| `toggle` | `() => void` | Toggle panel open/close |
| `setIsOpen` | `(open: boolean) => void` | Set panel visibility directly |

Persistence key: `"app:scripts:hook-template-panel"`

---

## Components

### `HookTemplatePanel` (`~/components/scripts/hookTemplates/HookTemplatePanel.tsx`)

Right-side panel (w-72, border-l) displaying the template library.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `scripts` | `Script[]` | All scripts in the project (for "Récents" filtering) |
| `focusedScript` | `Script` | Currently selected script |
| `onApplyTemplate` | `(template: HookTemplate) => void` | Apply template handler |

**Category Tabs (ToggleChip):**
| Tab | Label | Filter Logic |
|-----|-------|--------------|
| `all` | Tous | No filter, show all |
| `public` | Publics | `isPublic === true` |
| `private` | Privés | `isPublic === false` |
| `recent` | Récents | Template UUID found in any script's `hookTemplate` |

Filtering is client-side — no extra API calls needed.

### `HookTemplateCard` (`~/components/scripts/hookTemplates/HookTemplateCard.tsx`)

Clickable card in the panel list. Shows template title and content preview with `[placeholder]` tokens highlighted in primary color.

### `ApplyHookTemplateModal` (`~/components/scripts/hookTemplates/ApplyHookTemplateModal.tsx`)

Confirmation dialog using `ModalOverlay`. Shown when the user clicks a template and the script already has hook text. On confirm, updates the script's hook text and links the template.

---

## Integration in ScriptPageView

**`ScriptPageView.tsx`** orchestrates the apply flow:

1. User clicks a template card in `HookTemplatePanel`
2. If the script has existing hook text → show `ApplyHookTemplateModal`
3. If the script has no hook text → apply directly (skip dialog)
4. On confirm: `updateScript({ hook: template.content, hookTemplateUuid: template.uuid })`

The right panel renders conditionally based on `useHookTemplatePanelStore.isOpen`.

---

## Toggle Button

**`ScriptMetaHeader.tsx`** has a `BookOpenIcon` button next to the hook TextArea:
- Default: `text-gray` with `hover:text-dark`
- When script has a linked template: `text-primary` (visual indicator)
- Clicking toggles `useHookTemplatePanelStore`

---

## Layout

```
┌──────────────┬─────────────────────────────┬──────────────┐
│ ScriptList   │    ScriptEditorPanel        │ HookTemplate │
│ Panel (w-72) │    (flex-1)                 │ Panel (w-72) │
│              │                             │  (optional)  │
│ border-r     │ ScriptMetaHeader            │  border-l    │
│              │ ScriptPartsList             │              │
└──────────────┴─────────────────────────────┴──────────────┘
```

---

## Relationships

```
Script (N) ──── (0..1) HookTemplate    [hookTemplate field, nullable]
HookTemplatePanel ──── uses ──── useListHookTemplates
ScriptPageView ──── contains ──── HookTemplatePanel + ApplyHookTemplateModal
ScriptMetaHeader ──── toggles ──── useHookTemplatePanelStore
```
