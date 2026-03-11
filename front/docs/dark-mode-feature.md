# Dark Mode Feature

## Overview

The app supports a toggleable dark/light theme. The implementation leverages Tailwind v4's CSS custom properties: `@theme` compiles to `:root` variables, and a `:root.dark` block overrides them. Because utility classes like `bg-clear` resolve to `var(--color-clear)` at runtime, most of the app auto-switches with zero component changes.

---

## Architecture

### CSS Variables (`app.css`)

The `@theme` block defines design tokens as CSS custom properties (e.g. `--color-clear`, `--color-dark`). A `:root.dark` block overrides these values:

| Token | Light | Dark |
|-------|-------|------|
| `--color-clear` | `#FFFFFF` | `#1a1a2e` |
| `--color-dark` | `#141115` | `#F0F0F0` |
| `--color-light-gray` | `#D9D9D9` | `#2d2d44` |
| `--color-gray` | `#6b7280` | `#9ca3af` |
| `--color-gray-400` | `#9ca3af` | `#6b7280` |
| `--color-gray-900` | `#111827` | `#F0F0F0` |
| `--color-surface-hover` | `#F9FAFB` | `#23233a` |
| `--shimmer-highlight` | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.1)` |

The `body` rule sets `color: var(--color-dark)` so all text inherits the correct color by default.

### Theme Store (`stores/theme/themeStore.ts`)

Zustand store with `persist` middleware. Stores `isDark` boolean in `localStorage` under key `app:theme`. **Defaults to dark mode** (`isDark: true`).

**API:**
- `isDark: boolean` — current theme state (default: `true`)
- `toggleTheme()` — toggles dark/light, syncs `.dark` class on `<html>`

The `onRehydrateStorage` callback re-applies the `.dark` class after Zustand hydrates from localStorage.

### Anti-Flash Script (`root.tsx`)

A blocking `<script>` in `<head>` reads `localStorage('app:theme')`, parses the Zustand state shape, and adds `.dark` to `<html>` before paint. Since dark mode is the default, the script adds `.dark` unless localStorage explicitly has `isDark: false`. This prevents a flash of the wrong theme on page load.

### Theme Toggle (Sidebar)

Located in `components/sidebar/SideBar.tsx`. Uses `IconWithTextTile` with `MoonIcon`/`SunIcon` from Heroicons. Positioned above the Settings and Help links in the bottom navigation section.

---

## Rules for Theme-Aware Components

1. **Always use design tokens** — use `bg-clear`, `text-dark`, `border-light-gray`, `text-gray` instead of raw Tailwind colors like `bg-white`, `text-gray-900`, `border-gray-200`
2. **Use `bg-surface-hover`** for hover states on rows/tiles instead of `hover:bg-gray-50`
3. **Use `bg-light-gray`** for shimmer/skeleton backgrounds instead of `bg-gray-200`
4. **Use `--shimmer-highlight`** CSS variable for shimmer animation highlights via `via-[var(--shimmer-highlight)]`
5. **Use `bg-danger/10`** for error backgrounds instead of `bg-red-50`
6. **Use `text-danger`** for error text instead of `text-red-700`

If you need a new color that must switch between themes, add it to both `@theme` and `:root.dark` in `app.css` rather than using raw Tailwind colors.

---

## Files

| File | Role |
|------|------|
| `app/app.css` | CSS tokens, `:root.dark` overrides, `--shimmer-highlight` |
| `app/root.tsx` | Anti-flash script, `text-dark` on body |
| `app/stores/theme/themeStore.ts` | Zustand persist store |
| `app/components/sidebar/SideBar.tsx` | Theme toggle UI |
