# Page Design Doc — Profile

## Goal

Let users manage basic profile information and UI preferences (accent theme).

## Primary actions

- Update display name, pronouns, bio (if present)
- Choose UI accent theme (Calm/Cozy/Focus)
- Save profile

## Layout / sections

- Profile form card
- Theme selection control
- Optional links section (YouTube/Spotify) if used

## States

- Loading existing profile
- Saving state (disable button while saving)
- Error state for save failures

## Data

- **Reads/Writes**: `user_profiles` Firestore document
- **Calls**: Firebase Auth `updateProfile` (display name)

## Components used

- `AppLayout`
- `PageFade`
- Form controls

## Accessibility / UX notes

- Save feedback must be clear (success vs error)
- Keep form values stable on errors

## Acceptance criteria

- Saved theme applies to the app shell immediately
- Display name updates without requiring re-login

