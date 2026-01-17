# UI Style Guidelines - Frontend Documentation

## Overview

This document describes the design system, typography, colors, and UI components used in the MakerFlow application. The design follows a clean, modern aesthetic with Tailwind CSS for styling.

---

## Fonts

### Font Families

| Font | CSS Variable | Usage |
|------|--------------|-------|
| **Outfit** | `--font-family-display` | Headings, titles, UI text |
| **Roboto** | `--font-family-sans` | Body text, fallback |

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap');
```

---

## Typography

### Font Sizes

| Variable | Size | Rem |
|----------|------|-----|
| `--font-size-xs` | Extra Small | 0.75rem |
| `--font-size-sm` | Small | 0.875rem |
| `--font-size-base` | Base | 1rem |
| `--font-size-md` | Medium | 1.125rem |
| `--font-size-lg` | Large | 1.25rem |
| `--font-size-xl` | Extra Large | 1.5rem |
| `--font-size-2xl` | 2X Large | 2rem |
| `--font-size-3xl` | 3X Large | 2.5rem |
| `--font-size-4xl` | 4X Large | 3rem |

### Heading Classes

Use these classes for headings. All use the **Outfit** font family.

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.text-heading-4xl` | 3rem | 700 (Bold) | Hero titles |
| `.text-heading-3xl` | 2.5rem | 600 (Semi-bold) | Page titles |
| `.text-heading-2xl` | 2rem | 600 | Section titles |
| `.text-heading-xl` | 1.5rem | 600 | Large headings |
| `.text-heading-lg` | 1.25rem | 600 | Modal titles |
| `.text-heading-md` | 1.125rem | 500 (Medium) | Card titles |
| `.text-heading-sm` | 0.875rem | 500 | Labels, small titles |
| `.text-heading-xs` | 0.75rem | 500 | Micro labels |

### Body Classes

Use these classes for body text. All use the **Outfit** font family with gray color.

| Class | Size | Usage |
|-------|------|-------|
| `.text-body-lg` | 1.25rem | Large paragraphs |
| `.text-body-md` | 1.125rem | Medium paragraphs |
| `.text-body-base` | 1rem | Standard body text |
| `.text-body-sm` | 0.875rem | Small descriptions |
| `.text-body-xs` | 0.75rem | Captions, hints |

---

## Color Palette

### Primary Colors

| Name | Variable | Hex | Usage |
|------|----------|-----|-------|
| **Primary** | `--color-primary` | `#43CEA9` | Primary actions, highlights, selection |
| **Dark** | `--color-dark` | `#141115` | Text, dark backgrounds |
| **Clear** | `--color-clear` | `#FFFFFF` | White backgrounds, text on dark |
| **Danger** | `--color-danger` | `#D33F49` | Error states, destructive actions |

### Gray Scale

| Name | Variable | Hex | Usage |
|------|----------|-----|-------|
| **Gray 900** | `--color-gray-900` | `#111827` | Darkest text |
| **Gray** | `--color-gray` | `#6b7280` | Secondary text, icons |
| **Gray 400** | `--color-gray-400` | `#9ca3af` | Placeholder text |
| **Light Gray** | `--color-light-gray` | `#D9D9D9` | Borders, dividers, hover states |

### Accent Colors

| Name | Variable | Hex | Usage |
|------|----------|-----|-------|
| **Red** | `--color-red` | `#E4572E` | Warnings, alerts |
| **Yellow** | `--color-yellow` | `#E7BC21` | Warnings, pending states |
| **Green** | `--color-green` | `#A8C686` | Success states |
| **Blue** | `--color-blue` | `#669BBC` | Info, links |
| **Purple** | `--color-purple` | `#5346B6` | Special highlights |
| **Pastel Green** | `--color-pastel-green` | `#BCD5AA` | Soft success backgrounds |

---

## Common Patterns

### Border Radius

| Usage | Class |
|-------|-------|
| Buttons, Inputs | `rounded-xl` |
| Cards, Modals | `rounded-xl` or `rounded-lg` |
| Pills, Chips | `rounded-full` |
| Small elements | `rounded-md` |

### Borders

```css
border border-light-gray  /* Standard border */
```

### Shadows

```css
shadow-sm   /* Subtle shadow for inputs */
shadow-md   /* Medium shadow for dropdowns */
shadow-lg   /* Large shadow for modals */
```

### Focus States

```css
focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
```

### Hover States

```css
hover:bg-light-gray  /* Standard hover background */
hover:bg-gray        /* Button hover */
```

### Transitions

```css
transition-colors    /* Color transitions */
transition-all duration-300 ease-in-out  /* Sidebar animations */
```

---

## UI Components

### Button

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/Button.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Button content |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `style` | `'primary' \| 'secondary' \| 'danger'` | `'secondary'` | Visual style |
| `width` | `string` | `'w-full'` | Width class |
| `isLoading` | `boolean` | `false` | Shows spinner |
| `disabled` | `boolean` | `false` | Disabled state |
| `onClick` | `() => void` | - | Click handler |
| `className` | `string` | `''` | Additional classes |

**Styles:**
- **Primary:** Green background (`bg-primary`), white text
- **Secondary:** Dark background (`bg-dark`), white text
- **Danger:** Red background (`bg-danger`), white text

**Example:**
```tsx
<Button style="primary" isLoading={isPending}>
  Créer le projet
</Button>
```

---

### CircularButton

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/CircularButton.tsx`

Small circular button with primary background. Used for icon-only actions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Icon content |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `onClick` | `() => void` | - | Click handler |

---

### SimpleTextButton

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/SimpleTextButton.tsx`

Minimal text-only button for inline actions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Button content |
| `onClick` | `() => void` | - | Click handler |
| `color` | `string` | `'text-gray'` | Text color class |
| `hoverColor` | `string` | `'hover:text-dark'` | Hover color class |

---

### Input

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/Input.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text |
| `error` | `string` | - | Error message |
| `fullWidth` | `boolean` | `false` | Full width mode |
| `simple` | `boolean` | `false` | Borderless mode |
| `icon` | `ReactNode` | - | Left icon |
| `autoComplete` | `string` | `'off'` | Autocomplete attribute |
| `textStyle` | `string` | `'text-sm'` | Text size class |

**Variants:**
- **Standard:** Rounded border, shadow, focus ring
- **Simple:** No border, no shadow (for inline editing)

**Example:**
```tsx
<Input
  label="Nom"
  placeholder="Entrez le nom"
  fullWidth
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

---

### TextArea

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/TextArea.tsx`

Auto-resizing textarea with same styling as Input.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text |
| `error` | `string` | - | Error message |
| `fullWidth` | `boolean` | `false` | Full width mode |
| `simple` | `boolean` | `false` | Borderless mode |
| `textStyle` | `string` | `'text-sm'` | Text size class |

**Features:**
- Auto-resizes based on content
- Minimum height of 60px

---

### Select

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/Select.tsx`

Native select dropdown with custom styling.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text |
| `error` | `string` | - | Error message |
| `fullWidth` | `boolean` | `false` | Full width mode |
| `placeholder` | `string` | - | Placeholder option |
| `options` | `Array<{value, label}>` | - | Options array |

---

### ToggleChip

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/ToggleChip.tsx`

Selectable chip/tag component.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Chip text |
| `isSelected` | `boolean` | Selection state |
| `onToggle` | `() => void` | Toggle handler |

**States:**
- **Unselected:** Light gray border, gray text
- **Selected:** Primary background, white text, checkmark icon

---

### Badge

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/Badge.tsx`

Icon + label badge with optional actions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `HeroIcon` | - | Left icon component |
| `label` | `string` | - | Badge text |
| `textColor` | `string` | `'text-gray'` | Text color class |
| `bgColor` | `string` | - | Background color class |
| `onClick` | `() => void` | - | Click handler |
| `onOptionClick` | `() => void` | - | Options icon handler |
| `onRemoveClick` | `() => void` | - | Remove icon handler |

**Features:**
- Options and remove icons appear on hover

---

### Pill

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/Pill.tsx`

Small colored label/tag.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `ReactNode` | Pill content |
| `color` | `string` | Background color class |
| `className` | `string` | Additional classes |

---

### StepBadge

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/StepBadge.tsx`

Step indicator for multi-step flows.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Step label |
| `completed` | `boolean` | Completion state |

**States:**
- **Completed:** Green checkmark icon
- **In Progress:** Circular progress indicator

---

### ModalOverlay

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/ModalOverlay.tsx`

Modal backdrop with sidebar awareness.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Visibility state |
| `onClose` | `() => void` | - | Close handler |
| `children` | `ReactNode` | - | Modal content |
| `className` | `string` | `''` | Additional classes |

**Features:**
- Closes on Escape key
- Closes on backdrop click
- Adapts to sidebar expanded/collapsed state
- Prevents body scroll when open
- Uses React Portal

---

### SelectItemModal

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/SelectItemModal.tsx`

Generic selection modal with create button.

| Prop | Type | Description |
|------|------|-------------|
| `showModal` | `boolean` | Visibility state |
| `items` | `T[]` | Items to display |
| `selectedItemId` | `string \| null` | Currently selected item |
| `getItemId` | `(item: T) => string` | ID extractor |
| `onSelect` | `(item: T) => void` | Selection handler |
| `onClose` | `() => void` | Close handler |
| `onClickCreateButton` | `() => void` | Create button handler |
| `createButtonLabel` | `string` | Create button text |
| `renderItem` | `(args) => ReactNode` | Item renderer |

---

### SelectEnumDropdown

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/SelectEnumDropdown.tsx`

Dropdown for selecting enum values with icons.

| Prop | Type | Description |
|------|------|-------------|
| `selectedValue` | `T` | Currently selected value |
| `options` | `EnumConfig<T>[]` | Options with icon, label, colors |
| `onClose` | `() => void` | Close handler |
| `onSelect` | `(value: T) => void` | Selection handler |

---

### DatePicker

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/DatePicker.tsx`

French calendar date picker.

| Prop | Type | Description |
|------|------|-------------|
| `selectedDate` | `Date` | Currently selected date |
| `onDateSelected` | `(date: Date) => void` | Selection handler |
| `minDate` | `Date` | Minimum selectable date |

**Features:**
- French day/month names
- Past dates disabled (grayed out)
- Today highlighted in primary color
- Selected date has primary background

---

### CircularProgress

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/CircularProgress.tsx`

SVG circular progress indicator.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `70` | Progress 0-100 |
| `size` | `number` | `80` | Size in pixels |
| `color` | `string` | `'text-primary'` | Progress color class |

---

### Shimmer

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/Shimmer.tsx`

Loading placeholder with shimmer animation.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `string` | `'w-full'` | Width class |
| `height` | `string` | `'h-4'` | Height class |
| `radius` | `string` | `'rounded-md'` | Border radius class |

---

### AppNotification

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/AppNotification.tsx`

Toast notification component.

| Prop | Type | Description |
|------|------|-------------|
| `isError` | `boolean` | Error or success state |
| `message` | `string` | Notification message |

**Features:**
- Animated entrance/exit (Headless UI Transition)
- Dismissible with X button
- Green checkmark for success, red icon for error

---

## Utility Classes

### Width

| Class | Usage |
|-------|-------|
| `w-fit` | Width adapts to content (shrink-wrap) |
| `w-full` | Full width of parent |
| `min-w-fit` | Minimum width adapts to content |

**Example:**
```tsx
<div className="w-fit">Content determines width</div>
```

### Scrollbar

```css
.scrollbar-none  /* Hides scrollbar */
```

### Text Selection

```css
/* Global: text selection disabled */
body { user-select: none; }

/* Re-enable on specific elements */
.select-text { user-select: text !important; }
```

### Number Input Spinners

Number input spinners are globally hidden.

---

## Icons

The project uses **Heroicons** (v2).

**Import patterns:**
```tsx
// Outline icons (24px)
import { HomeIcon } from "@heroicons/react/24/outline";

// Solid icons (24px)
import { HomeIcon } from "@heroicons/react/24/solid";

// Mini icons (16px)
import { ChevronLeftIcon } from "@heroicons/react/16/solid";

// Small icons (20px)
import { XMarkIcon } from "@heroicons/react/20/solid";
```

**Standard icon sizes:**
- `size-3` (12px) - Micro icons in badges
- `size-3.5` (14px) - Small action icons
- `size-4` (16px) - Standard icons
- `size-5` (20px) - Navigation icons
- `size-6` (24px) - Large icons

**Standard stroke width:**
```tsx
<Icon className="size-4" strokeWidth={2} />
```

---

## Best Practices

1. **Use typography classes** (`text-heading-*`, `text-body-*`) instead of raw Tailwind text classes
2. **Use color variables** (`text-primary`, `bg-dark`, `border-light-gray`) for consistency
3. **Use `rounded-xl`** for buttons and inputs, `rounded-full` for pills/chips
4. **Always include focus states** on interactive elements
5. **Use Heroicons** for all icons, prefer outline style for navigation
6. **Use `ModalOverlay`** for all modal dialogs to ensure proper sidebar handling
7. **Use `Shimmer`** for loading states instead of spinners where appropriate
8. **Labels use `text-heading-sm`** class for form inputs
