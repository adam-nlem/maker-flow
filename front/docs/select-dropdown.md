# SelectDropdown Component - Frontend Documentation

## Overview

`SelectDropdown` is a self-contained dropdown component for selecting items from a list. It manages its own open/close state and positions the dropdown below the trigger element.

---

## Location

`@/front/app/components/ui/SelectDropdown.tsx`

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `T[]` | Yes | Array of items to display |
| `selectedItemId` | `string \| null` | No | ID of the currently selected item |
| `getItemId` | `(item: T) => string` | Yes | Function to extract unique ID from item |
| `onSelect` | `(item: T) => void` | Yes | Callback when an item is selected |
| `onClickCreateButton` | `() => void` | No | Callback for create button |
| `createButtonLabel` | `string` | No | Label for create button |
| `renderTrigger` | `(args) => ReactNode` | Yes | Custom renderer for the trigger element |
| `renderItem` | `(args) => ReactNode` | Yes | Custom renderer for each item |

### renderTrigger Arguments

```tsx
{
    onClick: () => void  // Callback to toggle the dropdown
}
```

### renderItem Arguments

```tsx
{
    item: T              // The item to render
    isSelected: boolean  // Whether this item is currently selected
    onSelect: () => void // Callback to select this item
}
```

---

## Usage Patterns

### Pattern 1: Entity Selection (with Create Button)

Use when selecting from a list of entities that can be created (e.g., TodoLists, Projects).

```tsx
import { ChevronUpDownIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import SelectDropdown from "~/components/ui/SelectDropdown"

<SelectDropdown<TodoList>
    items={todoLists}
    selectedItemId={focusedTodoList.uuid}
    getItemId={(todoList) => todoList.uuid}
    onSelect={(todoList) => setFocusedTodoListUuid(todoList.uuid)}
    onClickCreateButton={() => setIsCreateModalOpen(true)}
    createButtonLabel="Créer une nouvelle Todo List"
    renderTrigger={({ onClick }) => (
        <TodoListTile
            todoList={focusedTodoList}
            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
            onClick={onClick}
        />
    )}
    renderItem={({ item, isSelected, onSelect }) => (
        <TodoListTile
            todoList={item}
            isSelected={isSelected}
            showCreatedAt={true}
            onHoverRightIcon={<PencilSquareIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} onClick={(e) => {
                e.stopPropagation()
                setUpdatingTodoListUuid(item.uuid)
            }} />}
            onClick={onSelect}
        />
    )}
/>
```

### Pattern 2: Enum/Filter Selection (without Create Button)

Use when selecting from a predefined list of options (e.g., enums, filters).

```tsx
import { ChartBarSquareIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import SelectDropdown from "~/components/ui/SelectDropdown"

const metricOptions = Object.values(InsightMetric)

<SelectDropdown<InsightMetric>
    items={metricOptions}
    selectedItemId={metric}
    getItemId={(item) => item}
    onSelect={(item) => setMetric(item)}
    renderTrigger={({ onClick }) => (
        <FilterTile
            icon={ChartBarSquareIcon}
            label={socialAnalyticsMetricToFrenchTranslation[metric]}
            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
            onClick={onClick}
        />
    )}
    renderItem={({ item, isSelected, onSelect }) => (
        <FilterTile
            label={socialAnalyticsMetricToFrenchTranslation[item]}
            isSelected={isSelected}
            onClick={onSelect}
        />
    )}
/>
```

---

## Key Points

1. **Self-contained**: Manages open/close state internally - no external store needed
2. **Trigger + Dropdown**: Use `renderTrigger` to define the clickable element, dropdown appears below it
3. **Backdrop**: Clicking outside the dropdown closes it (uses `fixed inset-0 z-20` backdrop)
4. **ChevronUpDownIcon**: Use as `rightIcon` on triggers to indicate selection capability
5. **Selection Indicator**: Use a small primary dot (`h-1.5 w-1.5 rounded-full bg-primary`) in tile components
6. **Optional Create Button**: Omit `onClickCreateButton` and `createButtonLabel` for enum selection

---

## Related Files

- `@/components/ui/Button.tsx` - Button component for create action
- `@/components/tasks/todoLists/TodoListTile.tsx` - Entity tile pattern
- `@/components/insights/FilterTile.tsx` - Filter tile pattern
