# Script Picker Feature (Frontend)

Reusable modal UI for picking a `Script` to link to another entity (a post draft, a future asset, etc.). Replaces the bare `<select>` dropdown that didn't scale beyond a handful of scripts: this picker provides search, a status filter, and infinite-scroll pagination on top of the existing `GET /scripts` endpoint.

## Where it's used

- [`PostDraftDetailBody`](../src/components/agency/postDrafts/PostDraftDetailBody.tsx) — the "Linked script" row in the editable post-draft form.
- [`CreatePostDraftModal`](../src/components/agency/postDrafts/CreatePostDraftModal.tsx) — the script field in the create-draft form. The picker opens **beside** the create modal (see "Side-by-side mode" below).

Other call sites can adopt it by rendering `LinkedScriptField` (the trigger + modal package) or `ScriptPickerModal` directly.

## Components (`front/src/components/agency/scripts/`)

| Component | Role |
|---|---|
| `LinkedScriptField` | Drop-in trigger. Shows the linked script as a tile (title + status pill + `Change` button + `×` unlink) when `value` is non-null, or a dashed `+ Link a script` button otherwise. Owns the local `isPickerOpen` state and mounts `ScriptPickerModal`. Props: `projectUuid`, `value: Script \| null`, `onChange: (script: Script \| null) => void`, plus optional `pickerAlign?: ModalAlign` and `onPickerOpenChange?: (isOpen: boolean) => void` for side-by-side flows (see below). The `×` button calls `onChange(null)` directly — it does **not** open the modal. |
| `ScriptPickerModal` | Wraps `ModalOverlay` with header / body / footer (Cancel + Confirm). Holds a *pending* `Script` selection that resets every time the modal closes (`useEffect` on `isOpen`). Confirm calls `onConfirm(script)` and then `onClose()`; Cancel / Escape / backdrop click simply close without firing `onConfirm`. Props: `isOpen`, `onClose`, `onConfirm: (script: Script) => void`, `projectUuid`, `initialSelectedUuid?: string \| null`, `align?: ModalAlign`. |
| `ScriptPicker` | The modal body: `SearchBar` (pill placeholder + `⌘F`/`Ctrl+F` focus shortcut, 300 ms debounce) + status-filter chip row (`All` + the six `ScriptStatus` values, mirroring the chip styling from `PostDraftsList`) + infinite-scroll list. Uses `useListPaginatedScripts` with the local `searchTerm` / `statusFilter` state. Differentiates "empty project" vs "no matches" empty states. Local state on purpose — does **not** read from `useScriptFilterStore` so the modal never bleeds into the `/agency/scripts` page filters. |
| `ScriptPickerItem` | A single row inside the picker list. Title + status pill (driven by `scriptStatusToBgClass` / `scriptStatusToBorderClass` / `scriptStatusToTextClass` / `scriptStatusToIcon` enum maps). Selected state uses the same `bg-primary/10 border-primary/30` highlight as `ScriptCard`, but without the trash button. |

## Behavior summary

- **Open**: clicking the tile's `Change` link or the `+ Link a script` button opens the modal; the currently-linked script (if any) is pre-highlighted via the `initialSelectedUuid` prop until the user picks a different row.
- **Confirm**: enabled only once a row is selected. Calls `onConfirm(script)` then closes.
- **Cancel / Escape / backdrop**: closes without touching the parent's value.
- **Unlink**: the `×` on the tile clears the value without opening the modal (one click).
- **Search**: debounced 300 ms, served by the API (`searchTerm` query param). Empty string omits the param.
- **Status filter**: single-select chip row; `All` resets to no filter.
- **Pagination**: infinite scroll via `useInfiniteScroll` on the list container ref.

## Building blocks reused

- [`ModalOverlay`](../src/components/ui/ModalOverlay.tsx) — default `w-200` × `h-[80vh]`.
- [`SearchBar`](../src/components/ui/SearchBar.tsx) — `focusShortcut={{ key: "f", label: "F" }}`.
- [`useInfiniteScroll`](../src/hooks/useInfiniteScroll.ts).
- [`useListPaginatedScripts`](../src/hooks/api/scripts/useListPaginatedScripts.ts) — already supports `status` + `searchTerm` + `limit`, no changes needed.
- `Button` (`secondary` for Cancel, `primary` for Confirm).
- Enum maps from [`models/enums/ScriptStatus.ts`](../src/models/enums/ScriptStatus.ts).

## Translations

New keys under the `scripts` namespace in `services/i18n/locales/scripts/{en,fr}.json`:

```
scripts.picker.linkedField.label
scripts.picker.linkedField.linkAction
scripts.picker.linkedField.changeAction
scripts.picker.linkedField.unlinkAction
scripts.picker.modalTitle
scripts.picker.searchPlaceholder
scripts.picker.statusAll
scripts.picker.confirm
scripts.picker.empty.{title,subtitle}
scripts.picker.noResults.{title,subtitle}
```

Cancel reuses the global `actions.cancel` (default `common` namespace). Status chip labels reuse `enums:scriptStatus.*`.

## Form integration (post-draft example)

`usePostDraftEditForm` tracks the linked script as `linkedScript: Script | null` (replacing the previous `scriptUuid: string`). The submit step derives the uuid for the `PATCH /post-drafts/{uuid}` request body; `hasChanges` compares the uuid against `postDraft.script?.uuid` so picking a different script or clearing the link flips the animated Save button on in the header. Any other consumer adopting `LinkedScriptField` should follow the same pattern: store the full `Script` (for rendering) and forward `script.uuid` on submit.

## Side-by-side mode (picker opening from inside another modal)

When `LinkedScriptField` is rendered inside another `ModalOverlay` (e.g. `CreatePostDraftModal`), the picker would otherwise stack on top of its host and hide it. To keep both visible at the same level — sharing a single backdrop — the host opts into a side-by-side layout:

- The host passes `pickerAlign="right-of-center"` to `LinkedScriptField` so the picker offsets to the right of the viewport center.
- The host listens to `onPickerOpenChange` and, while the picker is open, passes `align="left-of-center"` to its own `ModalOverlay` so the host shifts itself left, leaving a 12 px gap between the two modals.
- The host's `onClose` guards on `isPickerOpen` to avoid Escape / backdrop clicks closing the host while the picker is on top (`ModalOverlay`'s Escape stack also enforces "topmost-only" close).
- `LinkedScriptField` auto-enables `nested` on the picker whenever `pickerAlign !== "center"`, so the inner overlay skips its own dark backdrop and only the host's `bg-black/40` shows through — both modals appear at the same level on one unified backdrop.

`ModalOverlay` itself supports three alignment modes — `center` (default), `left-of-center`, `right-of-center` — via the shared `ModalAlign` type, plus a `nested?: boolean` flag that suppresses the dark backdrop for stacked overlays. The horizontal transform is a `translate-x-[calc(±50%±6px)]` on the modal container and animates via `transition-transform duration-200 ease-out`. Body-scroll lock and Escape handling use a module-level stack so stacked overlays interoperate cleanly: body overflow is restored only when the last overlay closes, and Escape only fires on the topmost overlay.

## Out of scope

- No content-type / platforms / tags filters yet. The backend would support them with minor `ListScriptsQueryParamDTO` changes if/when needed.
