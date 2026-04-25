## Stores & State (Zustand + MMKV)

### Core pattern

- Use Zustand for state.
- For persistence, use `zustand/middleware` `persist` with `createJSONStorage`, backed by **MMKV**.

Reference implementation:

- `src/state/persisted/preferences-store.ts`

### Preferences store conventions

- Keep a **typed `Preferences` interface** and a `defaultPreferences` constant.
- Expose:
  - **`usePreferencesStore`** hook
  - **`getPreferences()`** utility (read outside React)
  - **`updatePreferences()`** utility (write outside React)
- Track hydration:
  - `_isHydrated` boolean
  - `setIsHydrated()`
  - `onRehydrateStorage` sets hydrated state

### MMKV storage wrapper

This repo uses `createMMKV({ id: STORAGE_KEY })` and provides a `StateStorage` adapter that:

- stores strings
- returns `null` when missing (as expected by `zustand` storage contract)

### General guidance

- Prefer `Partial<T>` updates with a dedicated setter (`setPreferences`) that merges with existing state.
- Keep store keys stable (`STORAGE_KEY`) because it affects MMKV persistence.
