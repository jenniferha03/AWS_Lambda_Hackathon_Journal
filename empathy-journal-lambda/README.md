# Empathy Journal (Frontend)

This folder contains the **React frontend** for Empathy Journal.

## Run locally

```bash
npm install
npm run dev
```

Create `.env` with your API and Firebase config:

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

Optional for **local demo login** when the demo-login HTTP endpoint is unreachable: `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD` (see `.env.example`). Successful **AI Insight** runs auto-save journal rows to Firestore; emotion trend widgets only aggregate entries that include an AI `emotion` field.

For the full project overview (including the serverless backend), see the root `README.md`.
