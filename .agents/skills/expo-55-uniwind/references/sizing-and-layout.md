## Sizing & Layout

### Use Tailwind utilities first

- Prefer standard Tailwind layout utilities (`flex-1`, `flex-row`, `items-center`, `justify-between`, `gap-*`, `p-*`, `m-*`).

### Scaled width/height/size (`wpx` / `hpx`)

- For **width / height / size** values that should **scale with screen size**, prefer:
  - **`wpx(n)`** from `src/utils/screen-utils.ts`
  - Examples: icon `size`, fixed button height, image dimensions, component widths
- Use **`hpx(n)`** only for **layout spacing** (optional) when a vertical spacing needs to scale (e.g. `mt`, `py`, gaps). Prefer Tailwind spacing utilities first.

### Custom utilities in this repo

Defined in `src/styles/utilities.css`:

- **`flex-center`**: center both axes
- **`flex-center-x`**: row + center both axes
- **`abs-center` / `abs-center-x` / `abs-center-y`**: absolute centering helpers
- **`rounded-*`**: allows numeric border radius via `rounded-12`, `rounded-16`, etc.
- **`rounded-full`**: 999px radius

### Safe area utilities

Safe area is wired in `src/providers/theme-provider.tsx` via:

- `SafeAreaListener` → `Uniwind.updateInsets(insets)`

So you can use Uniwind safe-area utilities like:

- `pt-safe`, `pb-safe`, `px-safe`, etc.

- Prefer building layouts in the screen component.
- Keep routes thin.
