# Backend API Contract — Gemini Journal Analyzer

## Location in repo

- Lambda code: `backend/lambda/gptJournalAnalyzer/index.js`
- Local invoke: `backend/lambda/gptJournalAnalyzer/invoke-local.js`
- Smoke test: `backend/lambda/gptJournalAnalyzer/smoke-test.js`

## Endpoint

Deployed behind **API Gateway**. The frontend uses:

- `VITE_LAMBDA_URL` (example): `https://<api-gateway-id>.execute-api.<region>.amazonaws.com/<stage>/analyze`
- `VITE_DEMO_LOGIN_URL` (optional explicit override): `https://<api-gateway-id>.execute-api.<region>.amazonaws.com/<stage>/demo-login`

## Method

- `POST`
- `Content-Type: application/json`

## Demo login endpoint

`POST /demo-login`

Request body: none

Successful response:

```json
{
  "customToken": "string"
}
```

Use this token with Firebase `signInWithCustomToken` on the frontend.

## Request body

```json
{
  "journal": "string"
}
```

## Successful response (200)

Strict JSON schema returned:

```json
{
  "emotion": "string",
  "themes": ["string"],
  "reflection_prompts": ["string", "string", "string"],
  "summary": "string"
}
```

Notes:
- `reflection_prompts` is normalized to **exactly 3 items** to keep the UI consistent.

## Error responses

- `400`: missing required input
  - `{ "error": "Missing required field: journal" }`
- `429`: Gemini quota exceeded
  - `{ "error": "Gemini quota exceeded. Please try again later." }`
- `500`: configuration or unexpected errors
  - `{ "error": "Unable to process your request right now." }`
- `502`: upstream Gemini API failure
  - `{ "error": "Unable to process your request right now." }`

## CORS

Lambda returns permissive CORS headers for browser usage:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type,Authorization`
- `Access-Control-Allow-Methods: OPTIONS,POST`

## Environment variables

- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional, default: `gemini-2.5-flash`)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (required for `/demo-login`)
- `DEMO_UID` (required for `/demo-login`)

