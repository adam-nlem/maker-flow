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
| **Gray 900** | `--color-gray-900` | `#F0F0F0` | Darkest text |
| **Gray** | `--color-gray` | `#9ca3af` | Secondary text, icons |
| **Gray 400** | `--color-gray-400` | `#6b7280` | Placeholder text |
| **Light Gray** | `--color-light-gray` | `#2d2d44` | Borders, dividers, hover states |

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
transition-all duration-300 ease-in-out  /* Panel animations */
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
| `width` | `string` | `'w-full'` | Width class |
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
| `width` | `string` | `'w-full'` | Width class |
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

See detailed Pill documentation below in the **Script Feature Components** section.

---

### PremiumPlaceholder

**Location:** `front/app/components/ui/PremiumPlaceholder.tsx`

Placeholder for premium-only content. Blurs children and shows an upgrade CTA when restricted.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isRestricted` | `boolean` | - | Whether to show the placeholder |
| `title` | `string` | `"Fonctionnalite Premium"` | Placeholder heading |
| `description` | `string` | `"Passez a un abonnement..."` | Placeholder description |
| `children` | `ReactNode` | - | Content to blur/show |

**When restricted:**
- Children: `blur-sm pointer-events-none select-none`
- Placeholder: `absolute inset-0 bg-clear/60 z-10 rounded-xl`
- Content: `LockClosedIcon` (size-6, text-gray) + heading (`text-heading-md`) + description (`text-body-sm text-gray`) + primary Button to `/settings/subscription`

**When not restricted:** Renders children as-is.

---

### ConnectIntegrationPlaceholder

**Location:** `front/app/components/ui/ConnectIntegrationPlaceholder.tsx`

Placeholder shown when no integration is connected. Displays a message and a CTA button to navigate to the integrations settings page.

**Content:**
- `LinkIcon` (outline, size-6, text-gray)
- Heading: `"Aucune intégration connectée"` (`text-heading-md`)
- Description: `"Connectez un compte Instagram ou YouTube pour accéder à vos statistiques."` (`text-body-sm text-gray`)
- Primary Button: `"Connecter un compte"` → navigates to `/settings/integrations`

**Layout:** `flex flex-col items-center justify-center py-20`

**Used in:** `InsightsPageView` and `home.tsx` when `integrations.length === 0`.

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

### PasswordRules

**Location:** `app/components/ui/PasswordRules.tsx`

Real-time password strength feedback. Displays a list of rules with pass/fail indicators.

| Prop | Type | Description |
|------|------|-------------|
| `rules` | `PasswordRule[]` | Array from `getPasswordRules()` |

**Visual:**
- Passing: `CheckIcon` (outline, `size-3.5`, `text-primary`, `strokeWidth={2}`) + `text-body-xs text-primary`
- Failing: `XMarkIcon` (outline, `size-3.5`, `text-danger`, `strokeWidth={2}`) + `text-body-xs text-danger`
- Layout: `flex flex-col gap-1.5`

**Usage:** Shown below password inputs when `password.length > 0`. Used in registration and settings pages.

---

### ModalOverlay

**Location:** `@/Users/adam/1-dev/projets/maker-flow/front/app/components/ui/ModalOverlay.tsx`

Modal backdrop with sidebar-aware positioning.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Visibility state |
| `onClose` | `() => void` | - | Close handler |
| `children` | `ReactNode` | - | Modal content |
| `width` | `string` | `'w-200'` | Width class |
| `height` | `string` | `'h-[80vh]'` | Height class |

**Features:**
- Closes on Escape key
- Closes on backdrop click
- Offsets content area to account for sidebar width (w-72)
- Prevents body scroll when open
- Uses React Portal

---

### SidePanel

**Location:** `front/app/components/ui/SidePanel.tsx`

Reusable side panel layout with header, optional toolbar, scrollable body, and optional sticky footer. Supports collapsible animation with responsive mobile behavior.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Header title (ignored when `header` is provided) |
| `icon` | `HeroIcon` | — | Optional icon before the title (ignored when `header` is provided) |
| `width` | `"w-72" \| "w-96"` | `"w-72"` | Panel width |
| `side` | `"left" \| "right"` | `"right"` | Border side (`border-r` for left, `border-l` for right) |
| `isOpen` | `boolean` | — | If provided, wraps in collapsible animation. If omitted, always visible |
| `onClose` | `() => void` | — | If provided, shows close button in header |
| `headerActions` | `ReactNode` | — | Extra buttons right of title, before close button (ignored when `header` is provided) |
| `header` | `ReactNode` | — | Fully custom header that replaces the default title/icon/actions/close bar. Consumer owns padding, border, and close button |
| `toolbar` | `ReactNode` | — | Fixed content between header and scrollable body |
| `footer` | `ReactNode` | — | Sticky footer content (wrapped in `px-4 py-3 border-t`) |
| `children` | `ReactNode` | — | Scrollable body content (consumer handles padding) |

**Examples:**
```tsx
// Static left panel
<SidePanel title="Scripts" side="left" headerActions={<button>+</button>}>
    <div className="p-3 flex flex-col gap-1">{/* items */}</div>
</SidePanel>

// Collapsible right panel with footer
<SidePanel title="Générer" icon={SparklesIcon} width="w-96"
    isOpen={isOpen} onClose={closePanel} footer={<Button>Submit</Button>}>
    <div className="p-4">{/* form */}</div>
</SidePanel>

// Collapsible right panel with toolbar
<SidePanel title="Hooks" isOpen={isOpen} onClose={closePanel}
    toolbar={<div className="px-4 py-3 border-b border-light-gray"><Input /></div>}>
    <div className="p-3 flex flex-col gap-2">{/* list */}</div>
</SidePanel>

// Fully custom header (consumer owns close button)
<SidePanel isOpen={isOpen} onClose={closePanel}
    header={
        <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-light-gray">
            <h2 className="text-heading-md">{customTitle}</h2>
            <button onClick={closePanel}><XMarkIcon className="size-4" /></button>
        </div>
    }>
    <div className="p-4">{/* body */}</div>
</SidePanel>
```

**Responsive behavior (collapsible panels):**
- **Desktop (md+):** Sidebar with width transition (`w-0` → `w-72`/`w-96`), same as before
- **Mobile (<md):** Full-screen fixed overlay (`fixed top-12 left-0 right-0 bottom-0 z-40`) when open. `top-12` accounts for the mobile header bar. Panel content becomes full-width.

Non-collapsible panels (no `isOpen` prop) are not affected by this responsive behavior — parent components handle their own mobile layout.

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

### DonutChart

**Location:** `front/app/components/ui/DonutChart.tsx`

Donut chart component using Recharts `PieChart` + `Pie` + `Cell`. Supports a center label overlay.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `DonutChartItem[]` | — | Array of `{ label, value, color }` segments |
| `size` | `number` | `120` | Chart size in pixels |
| `centerLabel` | `string` | — | Main text in the donut hole |
| `centerSubLabel` | `string` | — | Secondary text below the center label |

---

### Pill

**Location:** `front/app/components/ui/Pill.tsx`

Unified pill component supporting multiple modes: toggle pill with HeroIcon, toggle pill with image, colored pill with suffix action.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `HeroIcon` | - | Optional prefix icon (HeroIcon SVG) |
| `suffixIcon` | `HeroIcon` | - | Optional suffix icon (e.g. XMarkIcon for removal) |
| `imageUrl` | `string` | - | Optional image URL (for platform icons, etc.) |
| `label` | `string` | **required** | Text label |
| `isSelected` | `boolean` | - | Toggle state (controls border style in toggle mode) |
| `onClick` | `() => void` | - | Click handler for the whole pill |
| `onSuffixClick` | `() => void` | - | Click handler for the suffix icon (stopPropagation built-in) |
| `bgColorClassName` | `string` | `""` | Background color class applied when `isSelected` is true |
| `borderColorClassName` | `string` | `""` | Border color class applied when `isSelected` is true |
| `textColorClassName` | `string` | `"text-dark"` | Text color class applied when `isSelected` is true |

**Styling:**
- `bgColorClassName`, `borderColorClassName`, and `textColorClassName` are only applied when `isSelected` is true. Always pass `isSelected` when using colored pills.
- Keep bg, border, and text classes separate — never mix them in a single prop.
- When `isSelected` is false/undefined, the pill renders with a dashed border and gray text.
- `suffixIcon` renders a clickable icon after the label with `stopPropagation` built-in.

**Usage in SelectDropdown:**
- `renderTrigger`: pass `onClick` directly on the Pill (no wrapping `<button>`)
- `renderItem`: hide the selected item with `!isSelected ? <Pill ... /> : null`
- Always pass separate `bgColorClassName`, `borderColorClassName`, and `textColorClassName`

**Examples:**
```tsx
// Colored pill in SelectDropdown trigger
<Pill onClick={onClick} label="A-Roll" isSelected bgColorClassName={shotTypeToBgClass[shotType]} textColorClassName={shotTypeToTextClass[shotType]} />

// Colored pill in SelectDropdown item
{!isSelected ? <Pill label={shotTypeToLabel[item]} isSelected onClick={onSelect} bgColorClassName={shotTypeToBgClass[item]} textColorClassName={shotTypeToTextClass[item]} /> : null}

// Tag pill with remove button
<Pill label="Intro" isSelected bgColorClassName="bg-blue/30" textColorClassName="text-blue" suffixIcon={XMarkIcon} onSuffixClick={handleRemove} />

// Pill with explicit border color
<Pill label="Placeholder" isSelected bgColorClassName="bg-primary/10" borderColorClassName="border-primary/30" textColorClassName="text-primary" />

// Toggle pill with image (platform selection) — uses borderColorClassName for selected border
<Pill imageUrl={iconUrl} label="Instagram" isSelected={true} onClick={toggle} borderColorClassName="border-light-gray" />

// Simple unselected pill (dashed border)
<Pill icon={TagIcon} label="Tag" onClick={openDropdown} />
```

---

### CompactMetricRow

**Location:** `front/src/components/ui/CompactMetricRow.tsx`

Compact inline row of PostInsightType-based metrics. Each metric renders as an icon + formatted value pair.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metrics` | `{ type: PostInsightType; value: number }[]` | - | Metrics to display |

**Features:**
- Resolves icons automatically via `postInsightTypeToIcon`
- Formats values via `formatPostInsightValue` (handles duration types like AverageWatchTime)
- Returns `null` if metrics array is empty

**Example:**
```tsx
<CompactMetricRow metrics={[
    { type: PostInsightType.Views, value: 12400 },
    { type: PostInsightType.Likes, value: 530 },
]} />
```

**Used in:** `RankingItemTile`

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

### ToastContainer

**Location:** `front/app/components/ui/ToastContainer.tsx`

Global toast notification system driven by a Zustand store. Renders active toasts as a fixed stack in the top-right corner.

**Store:** `useToastStore` (`front/app/stores/toast/toastStore.ts`)

| Store Action | Signature | Description |
|--------------|-----------|-------------|
| `addToast` | `(type: 'success' \| 'error', message: string) => string` | Adds a toast, returns its id |
| `removeToast` | `(id: string) => void` | Removes a toast by id |

**Features:**
- Auto-dismiss after 5 seconds
- Slide-in animation from the right (`animate-toast-in`)
- Dismissible with X button
- Error: `ExclamationCircleIcon` in `text-danger` / Success: `CheckCircleIcon` in `text-green`
- Stacked vertically with `gap-3`, fixed `top-4 right-4 z-50`
- Uses project design tokens: `rounded-xl`, `bg-clear`, `shadow-lg`, `ring-1 ring-dark/5`, `text-heading-sm`

**Usage (success toast in a mutation hook):**
```tsx
import { useToastStore } from '~/stores/toast/toastStore'

// Inside onSuccess callback:
useToastStore.getState().addToast('success', 'Projet créé avec succès')
```

**Note:** Error toasts are handled automatically by the global `MutationCache.onError` handler — no per-hook error handling is needed.

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

## Z-Index Hierarchy

| Layer | Z-index | Component |
|-------|---------|-----------|
| Premium overlay | `z-10` | PremiumPlaceholder |
| Mobile sidebar | `z-40` | SidePanel / MobileSidebar |
| Modals / Toasts | `z-50` | ModalOverlay, ToastContainer |
| Dropdown portals | `z-70` | All dropdown panels via `FloatingPortal` (`@floating-ui/react`) |

---

## Best Practices

1. **Use typography classes** (`text-heading-*`, `text-body-*`) instead of raw Tailwind text classes
2. **Always use design tokens** (`bg-clear`, `text-dark`, `border-light-gray`, `hover:bg-surface-hover`) — never use raw Tailwind colors (`bg-white`, `text-gray-900`, `border-gray-200`, `hover:bg-gray-50`)
3. **Use `rounded-xl`** for buttons and inputs, `rounded-full` for pills/chips
4. **Always include focus states** on interactive elements
5. **Use Heroicons** for all icons, prefer outline style for navigation
6. **Use `ModalOverlay`** for all modal dialogs to ensure proper sidebar handling
7. **Use `Shimmer`** for loading states instead of spinners where appropriate
8. **Labels use `text-heading-sm`** class for form inputs
