## Linting & Formatting (Ultracite + Biome)

### Commands

- **Fix formatting + lints**: `bun run fix` (runs `ultracite fix`)
- **Check issues**: `bun run check` (runs `ultracite check`)

### Repo configuration

- Biome config lives in `biome.jsonc`.
- Notable adjustments:
  - `noConsole` is `warn` (prefer `devLog` in app code)
  - `src/uniwind-types.d.ts` is excluded from formatting/linting

### Style expectations

- Keep code explicit and readable (Ultracite core principles).
- Prefer `const` and type-safe APIs.
- Avoid leaving debug logs in production code.
