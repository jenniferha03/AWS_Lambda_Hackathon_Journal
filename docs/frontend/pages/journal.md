# Page Design Doc — Journal

## Goal

Provide a distraction-free journaling experience and allow the user to generate and save AI insights.

## Primary actions

- Analyze with AI
- Save journal entry

## Layout / sections

- Journal editor area
- Two clear CTAs (Analyze vs Save)
- AI Insight panel (emotion, themes, summary, prompts)
- Previous journals list (scrollable)

## States

- Loading: while AI analysis is running
- Error: AI request failed / invalid output
- Empty: no previous journals yet

## Data

- **Reads**: `journals` for the current user (realtime list)
- **Writes**: save journal entry + AI insight to Firestore
- **Calls**: backend AI endpoint (`VITE_LAMBDA_URL`) for analysis

## Components used

- `AppLayout`
- `JournalList` (reusable)

## Accessibility / UX notes

- AI button and Save button must be visually distinct
- Preserve text on errors; never wipe user input

## Acceptance criteria

- AI returns structured insight and renders without layout issues
- Saving persists entry; list updates in realtime

