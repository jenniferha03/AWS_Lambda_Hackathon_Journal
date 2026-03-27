# Page Design Doc — Analytics

## Goal

Help users understand their emotional patterns and journaling consistency over time.

## Primary actions

- View emotion trends
- View streak garden / habit visualization

## Layout / sections

- Summary tiles (e.g., total entries)
- Emotion trends card
- Streak garden / streak visualization section

## States

- Loading: trends and streak data
- Empty: user has no journals/posts yet
- Error: non-blocking error display

## Data

- **Reads**: `journals` and relevant streak inputs (Firestore)
- **Writes**: none
- **Calls**: none

## Components used

- `AppLayout`
- `EmotionTrends` (reusable)
- Streak visualization component(s)

## Accessibility / UX notes

- Charts should have labels + readable colors in dark mode

## Acceptance criteria

- Total entries is consistent and does not double-count malformed data
- “Most recent emotions” chips match theme in both modes

