# Backend Observability — CloudWatch + Hoppscotch

## CloudWatch (what & why)

**Amazon CloudWatch** is AWS monitoring and logging.

For this project, CloudWatch is used to:
- **Inspect Lambda logs** (debugging `console.log` / `console.error`, stack traces)
- Track operational health with **metrics**: invocations, errors, duration, throttles
- Diagnose failures between API Gateway → Lambda → Gemini

## What to look for in logs

- Missing env vars (e.g., `GEMINI_API_KEY`)
- Gemini API non-200 responses
- JSON parse/normalization errors
- Timeouts (slow upstream)

## Hoppscotch (API testing workflow)

During development, Hoppscotch was used to validate the API Gateway endpoint before connecting it to the React UI:

- Verify request payload:
  - `POST` JSON body: `{ "journal": "..." }`
- Verify CORS:
  - ensure browser calls are not blocked
- Verify response format:
  - emotion, themes, summary, reflection prompts

Recommended: keep one saved Hoppscotch request as a “demo artifact” for interviews.

