# System Architecture Brief (for AI agent)

Role: Senior Full stack Architect

Project: Empathy Journal (mental wellness journaling + AI insight)

Tech stack:

- Frontend: React (Vite), Tailwind CSS, React Router
- Auth and database: Firebase Auth, Firestore
- Backend: AWS Lambda (Node.js) behind API Gateway
- AI: Google Gemini (Flash model) called from Lambda

## Architecture Rules

1) All AI analysis calls MUST go through AWS API Gateway.

- Frontend sends `POST` to `VITE_LAMBDA_URL`
- Do not call the Gemini API directly from the frontend

2) Backend returns a strict JSON contract and normalizes output.

- UI must not crash if the model response is malformed
- `reflection_prompts` must always be exactly 3 items
- `suggested_actions` must be 1 to 3 micro actions for the user

3) Persistence rules

- After a successful AI Insight response, the app auto saves the journal entry and insight into Firestore
- Demo accounts can seed data for demos; demo content is cleared on logout

4) Security boundaries

- Do not commit secrets or `.env` files
- Gemini API key is stored as Lambda environment variables

