# AI Instructions (Cursor) — Empathy Journal

This file documents how I used an AI coding agent (Cursor) during the AWS Lambda Hackathon to speed up implementation while keeping architectural ownership and quality.

## How I work with AI (high level)

- I do not ask the agent to scan the entire repo.
- I provide short context briefs and precise tasks, then I review and validate results with local runs, smoke tests, and UI behavior.
- I treat the agent as a productivity tool, not the decision maker. Architecture, security boundaries, and API contracts are my responsibility.

## Context briefs I provide before coding

I keep small, focused briefs in `docs/ai-context/`:

- `docs/ai-context/system-architecture.md`
- `docs/ai-context/component-standards.md`

When demoing, I open these briefs and explain that I guide the agent with project constraints instead of letting it guess.

## Prompt patterns I used (copy and reuse)

### 1) Architecture and contract first

Use this when adding or changing backend output fields.

> You are a senior full stack engineer. Do not change product scope.  
> Update the Lambda JSON contract and normalize output so the frontend never crashes.  
> Keep AI calls server side behind API Gateway.  
> After implementing, update the UI rendering and any demo seed content to match the new contract.

### 2) Debugging integration issues (CORS, fetch, env)

> Here is the exact error and the request URL.  
> Identify the most likely cause and propose a minimal fix.  
> Then list the fastest steps to verify the fix locally and on the deployed environment.

### 3) UI consistency changes

> Apply this UI change across the relevant layout(s) only.  
> Do not refactor unrelated files.  
> Keep Tailwind styling consistent with the existing palette and dark mode rules.

### 4) Safety and scope guardrails

> Do not add new dependencies unless necessary.  
> Do not commit `.env` or secrets.  
> Keep changes minimal and aligned with existing patterns.

## What I validate after AI generated changes

- Backend: `npm run test:smoke` and `npm run test:suggested-actions` (Lambda contract)
- Frontend: manual smoke test for the journal AI Insight flow (loading, error, success)
- Demo data: seeded journals include any new insight fields so the demo is consistent

