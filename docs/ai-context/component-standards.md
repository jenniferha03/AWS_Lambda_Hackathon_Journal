# Component Standards Brief (for AI agent)

Goal: Keep UI changes consistent with the existing Empathy Journal design system and patterns.

## Design Tokens

- Primary (dark mode emphasis): Magic Mint `#AAF0D1`
- Typography: Outfit for headings, Plus Jakarta Sans for body

## UI and Coding Standards

- Use functional components (JavaScript)
- Tailwind CSS for styling
- Reuse existing layout primitives and class patterns
- Avoid unrelated refactors

## AI related UI requirements

- Every AI related interaction must have a loading state and a user friendly error state
- Reflection prompts must always display exactly 3 items for visual symmetry
- If a new insight field is introduced, update:
  - the AI contract (Lambda prompt + normalization)
  - the primary journal insight UI
  - the journal history UI
  - any demo seeded journal insight objects

