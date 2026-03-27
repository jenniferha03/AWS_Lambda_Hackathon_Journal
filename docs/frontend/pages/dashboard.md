# Page Design Doc — Dashboard

## Goal

Give a quick daily check-in experience: post a mood note, see key wellness tools, and encourage journaling consistency.

## Primary actions

- Create a mood post (optionally with image)
- Delete a post
- Use quick tools (grounding, gentle prompt)

## Layout / sections

- Personal greeting + weekly mood summary
- Posting calendar + streak indicator
- “What’s on your mind?” post composer + feed list
- Grounding (5-4-3-2-1) and Gentle prompt sections

## States

- Loading: show placeholders for feed and calendar
- Empty: friendly “no posts yet” state
- Error: non-blocking message + keep UI usable

## Data

- **Reads**: `mood_posts` for the current user (realtime)
- **Writes**: add/delete mood posts
- **Calls**: Firestore only

## Components used

- `AppLayout`
- Calendar/Streak UI
- Post composer + post card list
- Grounding / prompt widgets

## Accessibility / UX notes

- Mobile responsive ordering (greeting/tools should not be pushed below long feeds)
- Destructive actions require confirmation

## Acceptance criteria

- Posts update in realtime after add/delete
- Layout remains usable on small screens
- Hover states are visible in both light/dark mode

