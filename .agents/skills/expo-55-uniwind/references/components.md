## Components & Primitives (`src/components/tw/`)

### Core rule

- **Prefer importing primitives from `@/components/tw`** instead of importing directly from `react-native`, `expo-image`, or `expo-router`.
- This repo intentionally centralizes “styleable primitives” so the app stays consistent and easy to refactor.

### What to import from `@/components/tw`

Common exports (see `src/components/tw/index.tsx`):

- **`View`**: wrapper around `react-native` `View`
- **`TextInput`**: wrapper around `react-native` `TextInput`
- **`ScrollView`**: wrappers around RN list primitives
- **`Pressable`**: wrapper around `react-native` `Pressable`
- **`Image`**: wrapper around `expo-image` `Image`
- **`Link`**: wrapper around `expo-router` `Link`
- **`PressableScale` / `PressableOpacity`**: from `pressto` + `withUniwind` (see `src/components/tw/pressto.tsx`). Use for tappable UI that should show clear press feedback (scale or opacity). **Only when the pressable has no `overflow: hidden` / content clipping** — the animation can conflict with overflow. If the control needs overflow (scroll, clipped children, etc.), use **`Pressable`** from `@/components/tw` instead.

Also check `src/components/tw/` for:

- **`Icon`**: wrapper for vector icons (Uniwind `className` + `size`/`color`). **Import the glyph** from `@/icons` and **`Icon`** from `@/components/tw`. Pass the component as `as={...}`, set **color** with `className` (e.g. `text-icon-primary`), and **size** with `size={wpx(n)}` from `@/utils/screen-utils` when you need screen-aware sizing.

  Example (see `src/screens/(main)/home/index.tsx`):

  ```tsx
  import { Icon } from "@/components/tw";
  import { IconMenu2Filled } from "@/icons";
  import { wpx } from "@/utils/screen-utils";

  <Icon as={IconMenu2Filled} className="text-icon-primary" size={wpx(24)} />
  ```

- **Third-party wrappers** (when needed)

### Class name composition

- Use **string literals** for class names whenever possible.
- For conditional or composable class names, use `cn()`:
- Source: `src/lib/utils.ts`

### Expo Router routes

- Route files under `src/app/` should be **thin**.
- Put UI + logic inside `src/screens/**/index.tsx`, and import that into the corresponding route.
