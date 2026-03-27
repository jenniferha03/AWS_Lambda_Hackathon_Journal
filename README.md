# Empathy Journal — AI‑Powered Reflection & Habit Builder

Empathy Journal is a journaling web app that helps users reflect, understand emotions, and build consistent writing habits. Users can write journal entries, generate AI insights (emotion, themes, summary, reflection prompts), and view trends like recent emotions and streak progress.

- **Live demo**: `https://empathy-journal.vercel.app/`

---

## Documentation (design + API)

See `docs/README.md` for:
- Frontend design docs (theme, component inventory, page specs, Figma checklist)
- Backend API contract + observability notes

---

## Repo structure (frontend + backend separated)

This repository contains two independent parts:

- **Frontend**: `empathy-journal-lambda/` (React + Vite + Tailwind + Firebase)
- **Backend**: `backend/lambda/gptJournalAnalyzer/` (AWS Lambda handler for Gemini analysis)

This separation makes it easy for reviewers/interviewers to understand how the UI and the serverless AI function work independently.

---

## What it does (non‑technical)

Many people want to journal but struggle with consistency or don’t know how to “go deeper.” This app makes journaling easier by:
- providing a calm writing space,
- generating gentle reflection prompts via AI,
- showing simple trends (recent emotions, streak progress) that help users stay motivated.

---

## Key features

- **Journaling + AI insights**
  - Analyze an entry to generate: emotion, themes, short summary, reflection prompts
- **Analytics**
  - Emotion trends and recent emotions
  - Streak / habit visualization
- **Toolkit**
  - Focus mode (Pomodoro), calm sounds, micro‑habits, study todo list
- **Auth + profiles**
  - Firebase Auth (email/password + Google)
  - Profile settings (display name, pronouns, UI accent theme)

---

## How AI is implemented (AWS Lambda + API Gateway + Gemini)

When the user clicks **Analyze with AI**, the frontend sends a `POST` request to an **API Gateway** endpoint, which triggers an **AWS Lambda** function. Lambda:
1. Receives the journal text
2. Calls the **Google Gemini API**
3. Normalizes the response to a strict JSON schema (emotion, themes, summary, prompts)
4. Returns the structured result to the frontend to display and save

---

## AWS services used

| Service | Purpose |
|--------|---------|
| **AWS Lambda** | Serverless function for Gemini analysis logic |
| **API Gateway** | HTTP endpoint that triggers Lambda |
| **CloudWatch** | Logs + monitoring for Lambda invocations |
| **IAM** | Permissions for Lambda execution |

---

## API testing (Hoppscotch)

During development I used **Hoppscotch** to test the API Gateway endpoint (request payload, CORS, and response format) before wiring it into the React UI.

---

## Local development

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

## How I used an AI assistant (for interviews)

I used an AI assistant to speed up development tasks such as:
- refactoring folder structure and updating imports safely,
- improving theme consistency across light/dark modes,
- implementing demo tools to seed realistic presentation data,
- debugging issues (build/import failures, real-time Firestore updates).

I reviewed and adjusted suggestions to match project constraints (Firebase/Auth edge cases, Tailwind dark-mode behavior, Firestore `onSnapshot` listeners).

