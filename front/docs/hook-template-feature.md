# Hook Template Feature - Frontend Documentation

## Overview

The Hook Template feature provides a reusable library of video hook templates. Users can browse public and private templates from a toggleable right panel in the script editor, then apply a template to a script hook part. Applying a template copies the template content into the hook's content and links the template reference to the `ScriptHook` entity.

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

### `ScriptHook` Model Update (`~/models/ScriptHook.ts`)

Added optional `hookTemplate` field (`HookTemplate | undefined`). When a template is applied, this field references the source template on the hook part entity.

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
| `useListPaginatedHookTemplates` | GET | `/hook-templates` | Infinite scroll (page/limit/hasMore), optional `searchTerm` |
| `useListHookTemplates` | GET | `/hook-templates` | List all accessible templates, optional `searchTerm` |
| `useCreateHookTemplate` | POST | `/hook-templates` | Create a new template (`title`, `content`, `isPublic?`) |
| `useUpdateHookTemplate` | PATCH | `/hook-templates/{uuid}` | Update own template |
| `useDeleteHookTemplate` | DELETE | `/hook-templates/{uuid}` | Delete own template |

All mutation hooks invalidate `hookTemplateQueryKeys.all` on success.

### `useUpdateScriptHook` Update (`~/hooks/api/scriptHooks/useUpdateScriptHook.ts`)

Added `hookTemplateUuid?: string | null` to `UpdateScriptHookData` to support linking/unlinking templates from script hooks.

---

## Zustand Stores

### `useScriptRightPanelStore` (`~/stores/scripts/scriptRightPanelStore.ts`)

Shared persisted store controlling both right panels (hook templates and script generation). Only one panel can be open at a time. Values: `ScriptRightPanel.Generate`, `ScriptRightPanel.HookTemplates`.

| Field | Type | Description |
|-------|------|-------------|
| `activePanel` | `ScriptRightPanel \| null` | Currently open panel (`ScriptRightPanel.Generate` or `ScriptRightPanel.HookTemplates`) |
| `openPanel` | `(panel) => void` | Open a specific panel |
| `closePanel` | `() => void` | Close the active panel |
| `togglePanel` | `(panel) => void` | Toggle: if same → close, else → open |

Persistence key: `"app:scripts:right-panel"`

### `useHookTemplateStore` (`~/stores/scripts/hookTemplateStore.ts`)

Transient store (no persistence) bridging communication between `HookTemplatePanel` and `ScriptHookCard`.

| Field | Type | Description |
|-------|------|-------------|
| `selectedTemplate` | `HookTemplate \| null` | Template clicked in panel, waiting for ScriptHookCard to process |
| `focusedHookTemplateUuid` | `string \| null` | UUID of the currently applied template (for highlight in panel) |
| `setSelectedTemplate` | `(template \| null) => void` | Set the selected template |
| `setFocusedHookTemplateUuid` | `(uuid \| null) => void` | Set the focused template UUID |

---

## Components

### `HookTemplatePanel` (`~/components/scripts/hookTemplates/HookTemplatePanel.tsx`)

Right-side panel (w-72, border-l) displaying the template library. No props — reads from `useHookTemplateStore` and `useScriptRightPanelStore`.

**Store interactions:**
- Reads `focusedHookTemplateUuid` from `useHookTemplateStore` to highlight the currently linked template
- Calls `setSelectedTemplate(template)` on `useHookTemplateStore` when the user clicks a template card

**Category Tabs (ToggleChip):**
| Tab | Label | Filter Logic |
|-----|-------|--------------|
| `all` | Tous | No filter, show all |
| `public` | Publics | `isPublic === true` |
| `private` | Privés | `isPublic === false` |

Filtering is client-side — no extra API calls needed. Uses `useListPaginatedHookTemplates` with infinite scroll (IntersectionObserver sentinel, `rootMargin: 200px`). Debounced search input (300ms) filters via API `searchTerm` param.

**Header actions:** `PlusIcon` button opens `CreateHookTemplateModal`, `XMarkIcon` closes the panel.

### `HookTemplateCard` (`~/components/scripts/hookTemplates/HookTemplateCard.tsx`)

Clickable card in the panel list. Shows template title and content preview. Uses `parseHookPlaceholders()` from `~/helpers/hookPlaceholderParser` to render `[placeholder]` tokens as `Pill` components with French translations from `HookTemplatePlaceholder` enum. Accepts `isSelected` prop to highlight the currently linked template (matched via `focusedHookTemplateUuid`).

### `CreateHookTemplateModal` (`~/components/scripts/hookTemplates/CreateHookTemplateModal.tsx`)

Creation modal opened via the `+` button in the panel header. Form fields: title (Input), content (TextArea with ref), visibility (ToggleChip: Privé/Public), and a placeholder palette. Clicking a placeholder Pill inserts the `[key]` token at the current cursor position in the content textarea. On submit, calls `useCreateHookTemplate` and closes — React Query invalidation refreshes the panel list automatically.

### `ApplyHookTemplateModal` (`~/components/scripts/hookTemplates/ApplyHookTemplateModal.tsx`)

Confirmation dialog using `ModalOverlay`. Rendered by `ScriptHookCard` when the user clicks a template and the script hook already has content. Shows the template title and content preview (with placeholder pills). On confirm, updates the hook's content and links the template via `useUpdateScriptHook`.

---

## Template Application Flow

`ScriptHookCard` owns the template application logic via `useHookTemplateStore`:

1. User clicks a template card in `HookTemplatePanel` → `setSelectedTemplate(template)` on the store
2. `ScriptHookCard` reacts via `useEffect` on `selectedTemplate`:
   - If the hook has no content → apply directly via `useUpdateScriptHook`
   - If the hook already has content → show `ApplyHookTemplateModal`
3. On confirm: `updateScriptHook({ hookUuid, scriptUuid, data: { content: template.content, hookTemplateUuid: template.uuid } })`
4. On cancel: clear `pendingTemplate` and `selectedTemplate`
5. `ScriptHookCard` syncs `hook.hookTemplate?.uuid` to `focusedHookTemplateUuid` in the store, so the panel highlights the applied template

`ScriptPageView` is a pure layout component — it renders `HookTemplatePanel` with no props.

---

## Toggle Button

`ScriptHookCard` has an `InboxStackIcon` button (hover-revealed via `opacity-0 group-hover:opacity-100`, passed as `headerActions` prop to `ScriptPartCard`) to toggle the template library panel. Clicking calls `togglePanel(ScriptRightPanel.HookTemplates)` on `useScriptRightPanelStore`.

---

## Layout

```
┌──────────────┬─────────────────────────────┬──────────────┬──────────────┐
│ ScriptList   │    ScriptEditorPanel        │ Generate     │ HookTemplate │
│ Panel (w-72) │    (flex-1)                 │ Panel (w-96) │ Panel (w-72) │
│              │                             │  (optional)  │  (optional)  │
│ border-r     │ ScriptMetaHeader            │  border-l    │  border-l    │
│              │ ScriptPartsList             │              │              │
└──────────────┴─────────────────────────────┴──────────────┴──────────────┘

Only one right panel (Generate or HookTemplate) can be open at a time via shared store.
```

---

## Enums

### `HookTemplateCategory` (`~/models/enums/HookTemplateCategory.ts`)

Category filter for the template panel. Values: `All`, `Public`, `Private`.
- `hookTemplateCategoryToFrenchTranslation`: French labels (Tous, Publics, Privés)

### `HookTemplatePlaceholder` (`~/models/enums/HookTemplatePlaceholder.ts`)

Represents `[placeholder]` tokens in template content. Values: `Topic`, `Audience`, `Benefit`, `Statistic`, `Problem`, `Product`, `Result`, `Emotion`, `Number`, `Goal`, `Date`.
- `hookTemplatePlaceholderToFrenchTranslation`: French labels (Sujet, Audience, Bénéfice, Statistique, Problème, Produit, Résultat, Émotion, Nombre, Objectif, Date)

---

## Placeholder System

Templates use `[placeholder]` tokens (e.g., `[Sujet]`, `[Audience]`) that users can fill in after applying a template.

**Shared helper** (`~/helpers/hookPlaceholderParser.ts`):
- `parseHookPlaceholders(content)`: Splits text into `HookPart[]` with `type: 'text' | 'placeholder'`
- `hasPlaceholders(content)`: Returns `true` if any `[...]` tokens remain
- `formatPlaceholderToken(placeholder)`: Returns `[key]` — single source of truth for the token format
- `insertPlaceholder(content, placeholder, cursorStart, cursorEnd)`: Inserts `[key]` at cursor position, returns `{ content, cursorPosition }`
- `replacePlaceholder(content, placeholder, value)`: Replaces all `[key]` occurrences with `value`

**Display in HookTemplateCard**: Placeholder tokens rendered as `Pill` with French translations.

**Interactive editing in ScriptHookCard**: When hook content has placeholders (`hasPlaceholders(content)`), `ScriptHookCard` renders `HookContentRenderer` instead of the plain `TextArea`. `HookContentRenderer` displays placeholder tokens as clickable `Pill` components (purple-tinted). Clicking a pill opens a popover input (positioned below, `z-30`, with fixed backdrop) where the user types a replacement value. Confirm with Enter or blur replaces all occurrences of that placeholder via `replacePlaceholder()` and auto-saves via `useUpdateScriptHook`. Escape cancels. Once all placeholders are filled, the card switches back to the standard `TextArea`.

---

## Relationships

```
ScriptHook (N) ──── (0..1) HookTemplate    [hookTemplate field, nullable]
HookTemplatePanel ──── uses ──── useListPaginatedHookTemplates
HookTemplatePanel ──── writes to ──── useHookTemplateStore.setSelectedTemplate
HookTemplatePanel ──── reads from ──── useHookTemplateStore.focusedHookTemplateUuid
ScriptHookCard ──── reads from ──── useHookTemplateStore.selectedTemplate
ScriptHookCard ──── writes to ──── useHookTemplateStore.focusedHookTemplateUuid
ScriptHookCard ──── renders ──── ApplyHookTemplateModal
ScriptHookCard ──── toggles ──── useScriptRightPanelStore (ScriptRightPanel.HookTemplates)
ScriptHookCard ──── uses ──── HookContentRenderer (when placeholders present)
ScriptPageView ──── contains ──── HookTemplatePanel (no props)
```
