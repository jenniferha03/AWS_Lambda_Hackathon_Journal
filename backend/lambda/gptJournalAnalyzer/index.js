const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.5-flash";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned an empty response.");
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const jsonString =
    firstBrace >= 0 && lastBrace >= 0
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

  return JSON.parse(jsonString);
}

function normalizeOutput(parsed) {
  return {
    emotion: typeof parsed?.emotion === "string" ? parsed.emotion : "Unknown",
    themes: Array.isArray(parsed?.themes) ? parsed.themes : [],
    reflection_prompts: Array.isArray(parsed?.reflection_prompts)
      ? parsed.reflection_prompts
      : [],
    summary: typeof parsed?.summary === "string" ? parsed.summary : "",
  };
}

exports.handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return response(500, { error: "Missing GEMINI_API_KEY in Lambda environment." });
    }

    const body = typeof event?.body === "string" ? JSON.parse(event.body) : event?.body || {};
    const journal = typeof body?.journal === "string" ? body.journal.trim() : "";

    if (!journal) {
      return response(400, { error: "Missing required field: journal" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      // Force stable API version v1 to avoid v1beta model mismatch issues.
      apiVersion: "v1",
    });

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

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "";
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

