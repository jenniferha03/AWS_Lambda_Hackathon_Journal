# Backend Implementation — AWS Lambda + Gemini (Interview Walkthrough)

This document is a **talk track** you can use when screen-sharing in an interview.

---

## 1) What I built (hackathon focus)

Because this project was built for an **AWS Lambda Hackathon**, I implemented the **serverless AI analysis backend** end-to-end:

- **API Gateway** exposes an HTTP endpoint
- **AWS Lambda** runs the journal analysis handler
- Lambda calls **Google Gemini** to generate structured reflection insights
- The frontend consumes the JSON output and renders it consistently

---

## 2) End-to-end request flow

### Step A — Frontend request

When a user clicks **“Analyze with AI”**, the frontend sends a `POST` request to the API Gateway URL configured in `VITE_LAMBDA_URL`.

Payload:

```json
{ "journal": "..." }
```

### Step B — API Gateway → Lambda

API Gateway triggers the Lambda function with an event like:

- `httpMethod: "POST"`
- `body: "{ \\"journal\\": \\"...\\" }"`

### Step C — Lambda calls Gemini

The Lambda handler:

1. Parses `event.body`
2. Validates `journal` is present
3. Builds a prompt that asks Gemini to return **STRICT JSON**
4. Calls Gemini `generateContent` endpoint
5. Parses the returned text into JSON
6. Normalizes the output to a stable schema
7. Returns the normalized JSON to the frontend

---

## 3) Output schema (contract)

The backend returns a JSON object with this schema:

```json
{
  "emotion": "string",
  "themes": ["string"],
  "reflection_prompts": ["string", "string", "string"],
  "summary": "string"
}
```

Why this matters:
- The UI can render emotion/themes/summary/prompts without defensive UI logic.
- It prevents “sometimes missing fields” from breaking the UX during a demo.

### Schema normalization (important detail)

LLMs can occasionally output arrays that are too short or too long.
To keep the UI consistent, Lambda normalizes:

- `reflection_prompts` → **exactly 3 items** (truncate or fill with safe defaults)

This was also validated using a small smoke test script.

---

## 4) Configuration & secrets (what runs where)

### Environment variables

Backend uses:

- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional; default: `gemini-2.5-flash`)

Local dev:
- stored in `backend/lambda/gptJournalAnalyzer/.env` (gitignored)

AWS:
- stored as **Lambda Environment Variables**

Key point for interviewers:
- No API keys are committed to git; secrets are injected via environment variables.

---

## 5) CORS & browser compatibility

Because the frontend runs in the browser, CORS must be handled.

Lambda returns headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type,Authorization`
- `Access-Control-Allow-Methods: OPTIONS,POST`

And it short-circuits preflight:
- if `httpMethod === "OPTIONS"` → `200`

---

## 6) Error handling strategy

The handler uses friendly, safe errors so the UI won’t crash:

- `400` if `journal` is missing
- `429` if Gemini quota is exceeded
- `500/502` for upstream failures or unexpected exceptions

The frontend can show a user-friendly message and let the user retry.

---

## 7) How I tested & debugged (tools)

### Hoppscotch (API testing)

I used **Hoppscotch** to test the API Gateway endpoint before wiring it into the UI:
- request payload format
- CORS behavior
- response JSON shape

### CloudWatch (observability)

I used **CloudWatch Logs** to debug real failures:
- missing env vars
- Gemini non-200 responses
- JSON parsing issues

### Smoke test (quick reviewer proof)

There is a small script that calls the Lambda handler locally and validates the response schema:

```bash
cd backend/lambda/gptJournalAnalyzer
npm run test:smoke
```

This is helpful for reviewers because it demonstrates the backend output contract without needing to run the full frontend.

---

## 8) What I used AI assistance for (and what I changed)

I used an AI assistant to speed up development and refactors, but I reviewed and adjusted output to match real constraints, such as:

- ensuring stable JSON parsing/normalization
- aligning error handling with UI requirements
- ensuring CORS and environment variables are configured correctly

