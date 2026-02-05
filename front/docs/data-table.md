# DataTable Component - Frontend Documentation

## Overview

`DataTable` is a generic, reusable table component for rendering tabular data with sticky headers, row click handling, and an `afterTable` slot for extra content (e.g., infinite scroll sentinels). It follows the same generic-with-render-props pattern as `SelectDropdown<T>`.

---

## Location

`@/front/app/components/ui/DataTable.tsx`

---

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `DataTableColumn<T>[]` | Yes | - | Column definitions (header, alignment, render function) |
| `data` | `T[]` | Yes | - | Array of items to display as rows |
| `getRowKey` | `(item: T) => string` | Yes | - | Function to extract unique key from item |
| `onRowClick` | `(item: T) => void` | No | - | Row click handler; enables hover/cursor styles |
| `afterTable` | `ReactNode` | No | - | Content rendered after `</table>` inside the scroll container |
| `className` | `string` | No | `""` | Additional classes on the outer scroll wrapper |

### DataTableColumn\<T\>

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `header` | `string` | Yes | - | Column header text (also used as React key) |
| `align` | `"left" \| "right"` | No | `"left"` | Text alignment for header and cells |
| `render` | `(item: T) => ReactNode` | Yes | - | Render function for cell content (no `<td>` wrapper needed) |

---

## Usage Patterns

### Pattern 1: Basic Table

```tsx
import DataTable, { type DataTableColumn } from "~/components/ui/DataTable";

const columns: DataTableColumn<User>[] = [
    { header: "Name", render: (user) => <span>{user.name}</span> },
    { header: "Email", render: (user) => <span>{user.email}</span> },
    { header: "Role", align: "right", render: (user) => <span>{user.role}</span> },
];

<DataTable<User>
    columns={columns}
    data={users}
    getRowKey={(user) => user.id}
/>
```

### Pattern 2: With Row Click

```tsx
const navigate = useNavigate();

<DataTable<Post>
    columns={columns}
    data={posts}
    getRowKey={(post) => post.uuid}
    onRowClick={(post) => navigate(`/posts/${post.uuid}`)}
/>
```

When `onRowClick` is provided, rows get `hover:bg-gray-50 cursor-pointer` styles.

### Pattern 3: With Infinite Scroll

Use the `afterTable` prop to place an IntersectionObserver sentinel inside the scroll container:

```tsx
const sentinelRef = useRef<HTMLDivElement>(null);

<DataTable<Post>
    columns={columns}
    data={filteredPosts}
    getRowKey={(post) => post.uuid}
    onRowClick={(post) => navigate(`/posts/${post.uuid}`)}
    afterTable={<div ref={sentinelRef} className="h-1" />}
    className="flex-1 min-h-0"
/>
```

---

## Rendering Details

- Outer wrapper: `border border-light-gray rounded-lg overflow-auto scrollbar-none`
- Headers: sticky `<thead>` with `bg-white z-10`, row separator `border-b border-light-gray text-body-xs`
- Cells: `px-3 py-2 text-sm` with alignment from `column.align`
- Row separators: `border-t border-light-gray`
- Column `render` returns content only; DataTable handles the `<td>` wrapping

---

## Key Points

1. **Generic**: Works with any data type via `DataTable<T>`
2. **Render functions**: Column `render` returns cell content, not `<td>` elements
3. **Hooks in cells**: If a cell needs hooks (e.g., data fetching), extract it into a component and use it in `render` (hooks can't be called inside render functions directly)
4. **afterTable**: Renders inside the scroll container but outside `<table>`, ideal for IntersectionObserver sentinels
5. **className**: Applied to the outer scroll wrapper for layout control (e.g., `flex-1 min-h-0`)

---

## Related Files

- `@/components/ui/SelectDropdown.tsx` — Same generic pattern with render props
- `@/modules/socialAnalytics/components/posts/ListSocialAnalyticsPostsTable.tsx` — First consumer (posts table with infinite scroll)
- `@/modules/socialAnalytics/components/posts/SocialAnalyticsPostDescriptionCell.tsx` — Example of a component-based cell render (uses hooks)
