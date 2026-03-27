# Component Inventory (Frontend)

This document lists reusable components and where they are used.

## Layout & routing

| Component | Used in pages | Purpose |
|---|---|---|
| `PublicLayout` | Landing, Pricing, FAQ, Blog, Login, Signup | Public navbar + footer shell |
| `AppLayout` | Dashboard, Journal, Analytics, Toolkit, Profile | Authenticated shell + account panel + demo tools |
| `ProtectedRoute` | `/app/*` | Auth gate |
| `PageFade` | Most pages | Smooth transitions |

## Feature components

| Component | Used in pages | Purpose |
|---|---|---|
| `EmotionTrends` | Analytics | Realtime emotion chips + trend bars |
| `JournalList` | Journal | Realtime journal history list + AI insight display |
| `StreakGarden` | Analytics (embedded) | Visual habit/streak representation |

## UI patterns (recommended to standardize)

These exist as repeated patterns and are candidates for shared UI components:

- **Buttons**: primary / secondary / ghost / destructive
- **Cards**: consistent border, radius, padding
- **Chips**: e.g. “Most recent emotions”
- **Modal/Confirm**: destructive confirmation (delete, clear demo content)
- **Forms**: labeled input, validation/error blocks

If you want stricter professionalism, move these into `src/components/ui/` with:
- `Button.jsx`
- `Card.jsx`
- `Chip.jsx`
- `Modal.jsx`

