# Page Design Doc — Toolkit

## Goal

Provide lightweight wellness tools that support reflection and focus without overwhelming the user.

## Primary actions

- Start/pause/reset focus timer (Pomodoro)
- Use calm sounds
- Track micro-habits
- Manage study todo list

## Layout / sections

- Micro-habits
- Breathing exercise
- Recommended actions
- Study todo list
- Focus mode (Pomodoro)
- Lofi playlist link card
- Calm sounds generator

## States

- Local persistence states (saved items, completed items)
- Error states should be rare (mostly localStorage)

## Data

- **Reads/Writes**: localStorage (habits, todos, toolkit preferences)
- **Calls**: none

## Components used

- `AppLayout`
- Toolkit cards

## Accessibility / UX notes

- Buttons must be keyboard accessible
- Audio controls have clear labels

## Acceptance criteria

- Toolkit state persists across refresh (localStorage)
- Layout remains readable on mobile

