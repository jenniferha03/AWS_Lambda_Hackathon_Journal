# Theme System — “Sunrise Calm”

## Design goals

- Calm, friendly, readable in both **light** and **dark** mode
- Soft pastels + ample whitespace (“cute Notion” vibe)
- Clear hierarchy: headings, cards, buttons, and chips are consistent

## Color tokens (conceptual)

### Light mode

- **Primary accent**: amber/peach (headings, primary emphasis)
- **Secondary accent**: mint/emerald (secondary actions / positive highlights)
- **Surface**: warm off-white / soft orange-50 background, white cards
- **Text**: slate-700/900
- **Borders**: amber-100

### Dark mode

- **Primary accent**: mint `#AAF0D1`
- **Surface**: slate-950 background + slate-900 cards
- **Text**: slate-100/200
- **Borders**: slate-700

## Implementation notes (frontend)

- **Light/Dark mode**: controlled via `ThemeContext` and Tailwind `dark:` variants.
- **Accent themes** (Calm/Cozy/Focus): implemented via CSS variables and an `html` class:
  - `accent-calm` (default)
  - `accent-cozy`
  - `accent-focus`

These are applied by the authenticated layout based on the user profile setting.

## Components & states

- **Buttons**: primary vs secondary must be visually distinct (avoid “same tone” confusion)
- **Hover**: use consistent hover lift + shadow in both modes
- **Empty/Error/Loading**: must be readable and match theme colors

