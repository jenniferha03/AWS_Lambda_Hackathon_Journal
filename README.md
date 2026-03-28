# Empathy Journal: Reflection.ai

Empathy Journal is a journaling web app that helps users reflect, understand emotional patterns, and build consistent writing habits. It combines a calm writing experience with AI-generated insights and simple wellness tools.

- **Live demo**: `https://empathy-journal.vercel.app/`

## Screenshot

![Landing page](./docs/assets/landing-photo.png)

---

## Architecture

- **Frontend**: `empathy-journal-lambda/`  
  React + Vite + Tailwind + Firebase Auth/Firestore
- **Backend**: `backend/lambda/gptJournalAnalyzer/`  
  AWS Lambda function behind API Gateway for Gemini analysis

### Request flow

1. User writes a journal entry and clicks **AI Insight**
2. Frontend sends `POST` to API Gateway (`VITE_LAMBDA_URL`)
3. API Gateway triggers Lambda
4. Lambda calls Gemini and normalizes output schema
5. Frontend shows the insight and **auto-saves** the entry (content + insight) to Firestore so it survives tab changes and reloads (demo data is still cleared on **logout**)
6. **Save Journal** remains for entries without running AI, or if auto-save fails

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Auth / Database**: Firebase Auth, Firestore
- **Backend**: AWS Lambda (Node.js), API Gateway
- **AI**: Google Gemini (`gemini-2.5-flash`)
- **Observability / Testing**: CloudWatch Logs, Postman/Hoppscotch, local smoke test script
- **Deployment**: Vercel (frontend), AWS Lambda (backend)

---

## Features

- **Journaling + AI Insight**
  - Analyze entries for emotion, themes, summary, and reflection prompts
  - Successful analyses are persisted automatically (no extra “save” step for the insight flow)
- **Analytics**
  - Emotion trends and dashboard copy use **AI-analyzed** journal entries only (entries saved without insight are not counted as “Unknown”)
  - Streak visualization for writing consistency
- **Toolkit**
  - Focus mode (Pomodoro), calm sounds, micro-habits, study todo list
- **Authentication + Profile**
  - Email/password + Google login
  - User profile + UI theme preferences
- **Demo account**
  - Demo login via Lambda custom token or, in local dev, email/password (`VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`); if the demo-login API fails locally, dev password sign-in is used as a fallback
  - Demo Firestore content is cleared on logout
- **Demo Helpers**
  - DEV-only demo seeding tools for presentation

---

## AWS + AI Implementation Notes

Because this project was built for an AWS hackathon, the serverless backend is intentionally explicit:

- Lambda validates input and handles CORS
- Lambda calls Gemini and enforces a stable JSON output schema
- `reflection_prompts` is normalized to exactly 3 items for UI consistency
- Errors are mapped to user-safe responses (`400`, `429`, `500/502`)

---

## Local Development

### Frontend

```bash
cd empathy-journal-lambda
npm install
npm run dev
```

Create `empathy-journal-lambda/.env`:

```bash
VITE_LAMBDA_URL="https://<your-api-gateway-endpoint>"
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_FIREBASE_MEASUREMENT_ID="..."
```

**Local demo login (optional):** If `POST` to the demo-login URL fails (e.g. CORS or wrong URL), set `VITE_DEMO_PASSWORD` (and matching `VITE_DEMO_EMAIL` for your Firebase demo user) so `npm run dev` can sign in without that call. See `empathy-journal-lambda/.env.example`.

### Backend (Lambda local invoke + smoke test)

```bash
cd backend/lambda/gptJournalAnalyzer
npm install
cp .env.example .env
# set GEMINI_API_KEY in .env
npm run invoke:local
npm run test:smoke
```

---

## Documentation Index

For full design and implementation docs, see:

- `docs/README.md`
- Frontend:
  - `docs/frontend/figma.md`
  - `docs/frontend/theme.md`
  - `docs/frontend/components.md`
  - `docs/frontend/pages/*.md`
- Backend:
  - `docs/backend/api.md`
  - `docs/backend/implementation.md`
  - `docs/backend/observability.md`

---

## Future Roadmap

- Add route-level code splitting and further bundle optimization
- Improve AI reliability UX (retry/fallback handling on quota/timeouts)
- Expand test coverage (frontend components + API contract checks)
- Add offline draft support (PWA-style behavior)
- Support richer export options (PDF/Markdown)
