## Colors & Theming

**Note:** Prefer **`className`** with theme token utilities (`bg-*`, `text-*`, `Icon` + `className`, etc.) for color. **Avoid `useThemeColor()`** unless you truly need a **resolved color string in JS** (e.g. native/system APIs, animation props, or other APIs that do not accept Uniwind `className`). The hook is for those edge cases, not the default way to theme the UI.

### Source of truth

- **Theme tokens live in CSS variables** in `src/styles/colors.css` and `src/styles/colors.type.ts`.
- Tokens are exposed to Tailwind utilities via `@theme inline` mappings (e.g. `--color-background`).

### Theming (color)

- **Per-theme values** live in `src/styles/colors.css` under **`@variant light` and `@variant dark`** in `@layer theme`. The same **semantic** variable names (e.g. `--text-primary`, `--action`, `--icon-primary`) are defined in each variant with the right hex (or other) values for that appearance.
- **Uniwind** drives which variant is active (e.g. light / dark from device or in-app choice). You **do not** branch on `theme` in the UI to pick a hex for most styling — use **semantic `className` utilities** first; **`useThemeColor()`** only when a JS string is required (see the note at the top).
- **Tailwind bridge**: `@theme inline` maps `var(--text-primary)` → `--color-text-primary`, etc. Utilities mirror the token: `text-text-primary`, `bg-background`, `text-icon-primary` (see the `--color-*` names in `colors.css`).
- If light and dark should differ for a screen, **change the token in both variants** in `colors.css` (or add a new semantic token there), not ad hoc `#fff` in a component.

### How to use theme colors

- **In className**: use Tailwind token utilities based on the mapped variables (they always use the **current** theme’s resolved values):
  - `bg-background`, `bg-background-secondary`
  - `text-text-primary`, `text-text-secondary`, `text-text-disabled`
  - `text-action`, `bg-action`, `text-icon-primary` / `text-icon-disabled` for text-like fills
- **Icons (vector)**: set color the same way — use **`Icon`** from `@/components/tw` (glyph from `@/icons`, `as={...}`) and pass **`className` with a semantic `text-*` token** (e.g. `text-icon-primary`), not a raw `color` prop. Details: `references/components.md`.

### Reading token values in JS/TS

Use the repo hook **only when `className` is not enough** (see the note at the top):

- **`useThemeColor()`** from `src/hooks/use-theme-color.ts`
  - Accepts a single token or an array of tokens.
  - Returns resolved values from CSS variables via Uniwind `useCSSVariable`.

Example patterns (tokens must be **`ThemeColor` names** — see `src/styles/colors.type.ts`):

- `const colorBgSecondary = useThemeColor("background-secondary")`
- `const [colorBgSecondary, colorTextPrimary] = useThemeColor(["background-secondary", "text-primary"])`

### Theme provider behavior

- `src/providers/theme-provider.tsx`:
  - Uses `useUniwind()` to read **current theme** (`light` / `dark`) and wires **StatusBar** style; **system UI** background via `expo-system-ui` uses a resolved `useThemeColor` value.
  - Updates safe-area insets via `SafeAreaListener` → `Uniwind.updateInsets(insets)` (enables safe-area utilities).

### Adding new tokens

When adding a new token:

- Add it under both `@variant light` and `@variant dark` in `src/styles/colors.css`.
- Map it in `@theme inline` to a `--color-*` variable so Tailwind utilities can reference it.
- Update the `ThemeColor` type in `src/styles/colors.type.ts` so `useThemeColor()` stays type-safe.
