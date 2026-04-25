---
name: expo-55-uniwind
description: >
  Project-specific conventions for the expo-55-uniwind Expo SDK 55 + Expo Router app.
  Applies when creating or editing screens, components, hooks, stores, styling, or i18n in this repo.
  Covers: Uniwind + Tailwind v4 (`src/global.css`), wrapped primitives from `src/components/tw`,
  theme tokens via CSS variables (`src/styles/colors.css`) + `useThemeColor`, Zustand+MMKV persisted stores,
  strongly-typed `useAppTranslation()` hook, and Ultracite/Biome formatting rules.
---

# expo-55-uniwind Project Conventions

## Stack Overview

- **Framework**: Expo SDK 55 + Expo Router (file-based routing under `src/app/`)
- **Styling**: Tailwind CSS v4 via Uniwind (CSS entry at `src/global.css`)
- **Linter/Formatter**: Biome via Ultracite (`ultracite check|fix`)
- **State**: Zustand + MMKV persistence (via `zustand/middleware`)
- **i18n**: i18next + `react-i18next` via strongly-typed `useAppTranslation()`
- **Data fetching**: TanStack Query v5 (providers under `src/providers/`)
- **Icons**: Generated local svg with [react-native-nano-icons](https://github.com/software-mansion-labs/react-native-nano-icons) in `src/assets/icons/`
- **Utilities**: `cn()` via `clsx` + `tailwind-merge` (`src/lib/utils.ts`)

## Project Structure (from native root: `/apps/native`)
- `src/app/` — Expo Router route files (thin shells, import screens from `src/screens/`)
- `src/screens/` — Screen logic + layout (grouped by route group folders like `(initial)` / `(main)`)
- `src/components/` — Shared components
- `src/components/tw/` — Uniwind-wrapped primitives + styled building blocks (prefer importing from here)
- `src/components/ui/` — Reusable UI pieces (modal, gradient text, etc.)
- `src/components/layout/` — Layout components (header layout, etc.)
- `src/providers/` — App-level providers (theme, i18n, react-query, fonts)
- `src/hooks/` — Shared hooks (`useThemeColor`, etc.)
- `src/state/` — Zustand stores (including persisted stores)
- `src/styles/` — Tailwind v4 `@theme` + `@utility` CSS and typed tokens
- `src/i18n/` — i18n setup, typed resources, and translation hook
- `src/lib/` — Shared library helpers (e.g. `cn`, haptics, constants)
- `src/utils/` — Small utilities (time, screen utils, dev logging)

## Convention References

Load the relevant reference file when working in that domain:

- **Components & Primitives** → `references/components.md`
- **Colors & Theming** → `references/colors-and-theming.md`
- **Sizing & Layout Utilities** → `references/sizing-and-layout.md`
- **State Management (Zustand + MMKV)** → `references/stores-and-state.md`
- **Translations (i18n)** → `references/i18n.md`
- **Linting & Formatting** → `references/biome-conventions.md`

## General Rules

- **Path alias**: `@/` maps to `src/`
- **Routes stay thin**: files in `src/app/` should delegate to `src/screens/*` (no heavy logic)
- **Prefer wrapped primitives**: import `View`, `Pressable`, `TextInput`, `Image`, `Link`, etc. from `src/components/tw`
- **Use `cn()`**: merge conditional classes with `cn()` from `@/lib/utils`
- **Use `devLog` (not raw `console.*`)**: prefer `devLog.*` from `@/utils/dev-log` for debug logging (and remove noisy logs before shipping)
