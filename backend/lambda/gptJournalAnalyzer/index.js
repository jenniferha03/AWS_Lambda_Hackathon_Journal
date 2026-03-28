const DEFAULT_MODEL = "gemini-2.5-flash";
const admin = require("firebase-admin");

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

let firebaseApp = null;

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function parseJsonBody(body) {
  if (typeof body !== "string") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function normalizeModelName(model) {
  const raw = (model || "").trim();
  if (!raw) return DEFAULT_MODEL;
  return raw.replace(/^models\//, "");
}

function extractJson(text) {
  if (!text || typeof text !== "string") throw new Error("Empty Gemini response");
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

function normalizePrompts(value) {
  const raw = Array.isArray(value) ? value : [];
  const cleaned = raw
    .filter((x) => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);

  const fallback = [
    "What is one small next step you can take today?",
    "What helped you cope, even a little?",
    "What would you tell a friend feeling the same way?",
  ];

  const out = cleaned.slice(0, 3);
  for (let i = out.length; i < 3; i += 1) out.push(fallback[i]);
  return out;
}

function normalizeOutput(parsed) {
  return {
    emotion: typeof parsed?.emotion === "string" ? parsed.emotion : "Unknown",
    themes: Array.isArray(parsed?.themes) ? parsed.themes : [],
    reflection_prompts: normalizePrompts(parsed?.reflection_prompts),
    summary: typeof parsed?.summary === "string" ? parsed.summary : "",
  };
}

function isDemoLoginRequest(event) {
  const parts = [
    event?.rawPath,
    event?.path,
    event?.resource,
    event?.requestContext?.path,
    event?.requestContext?.resourcePath,
  ];
  return parts.some((p) => String(p || "").toLowerCase().includes("demo-login"));
}

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON");
  }
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return firebaseApp;
}

async function handleDemoLogin() {
  const demoUid = String(process.env.DEMO_UID || "").trim();
  if (!demoUid) {
    return response(500, { error: "Demo login is not configured." });
  }
  try {
    const app = getFirebaseApp();
    const customToken = await admin.auth(app).createCustomToken(demoUid, { demo: true });
    return response(200, { customToken });
  } catch (error) {
    console.error("Demo login token error:", error);
    return response(500, { error: "Demo login is not available right now." });
  }
}

exports.handler = async (event) => {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "";
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (isDemoLoginRequest(event)) {
    return handleDemoLogin();
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini configuration error: missing GEMINI_API_KEY");
      return response(500, { error: "Unable to process your request right now." });
    }

    const body = parseJsonBody(event?.body);
    const journal = typeof body?.journal === "string" ? body.journal.trim() : "";

    if (!journal) {
      return response(400, { error: "Missing required field: journal" });
    }

    const modelName = normalizeModelName(process.env.GEMINI_MODEL);
    const prompt = `
You are a mental wellness reflection assistant.
Analyze the following journal entry and return STRICTLY valid JSON with this exact schema:
{
  "emotion": "string",
  "themes": ["string", "string"],
  "reflection_prompts": ["string", "string", "string"],
  "summary": "string"
}

Rules:
- Output only JSON, no markdown.
- themes should contain 2-5 short theme phrases.
- reflection_prompts should contain exactly 3 thoughtful prompts.
- summary should be 1-2 concise sentences.

Journal entry:
${journal}
`.trim();

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok || geminiData?.error) {
      console.error("Gemini API error:", geminiData?.error || geminiData);
      const status = geminiData?.error?.status;
      if (status === "NOT_FOUND") {
        return response(500, { error: "Configured Gemini model is not available." });
      }
      if (status === "RESOURCE_EXHAUSTED") {
        return response(429, { error: "Gemini quota exceeded. Please try again later." });
      }
      return response(502, { error: "Unable to process your request right now." });
    }

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = extractJson(text);
    const normalized = normalizeOutput(parsed);

    return response(200, normalized);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return response(500, {
      error: "Unable to process your request right now.",
    });
  }
};

