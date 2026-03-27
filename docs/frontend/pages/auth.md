# Page Design Doc — Auth (Login / Signup)

## Goal

Let users create an account and sign in securely, then enter the authenticated app experience.

## Primary actions

- Login (email/password)
- Signup (display name + email/password)
- Google sign-in (if enabled)
- Demo autofill (DEV-only)

## Layout / sections

- Card-centered form (calm theme)
- “Remember email” helper (UX convenience)
- Error state display

## States

- Loading: show disabled buttons/spinner while request is in flight
- Error: show friendly error copy + keep input values intact

## Data

- **Reads**: user profile (optional) after login
- **Writes**: Firebase Auth user; user profile doc
- **Calls**: Firebase Auth APIs

## Components used

- `PublicLayout`
- Form inputs / buttons

## Accessibility / UX notes

- Form labels are present and focus states visible
- Password field supports enter-to-submit

## Acceptance criteria

- Errors are visible and understandable
- Successful login navigates to `/app/dashboard`
- Demo autofill is visible only in DEV mode

