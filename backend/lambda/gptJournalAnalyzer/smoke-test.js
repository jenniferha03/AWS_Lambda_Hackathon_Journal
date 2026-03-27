const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const { handler } = require("./index");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function run() {
  if (!process.env.GEMINI_API_KEY || String(process.env.GEMINI_API_KEY).trim() === "") {
    console.log("GEMINI_API_KEY is missing.");
    console.log("Create backend/lambda/gptJournalAnalyzer/.env and set GEMINI_API_KEY, then re-run:");
    console.log("  npm run test:smoke");
    process.exit(0);
  }

  const event = {
    httpMethod: "POST",
    body: JSON.stringify({
      journal: "I felt anxious earlier, but after breathing and writing I feel calmer and more hopeful.",
    }),
  };

  const res = await handler(event);

  assert(res && typeof res === "object", "Lambda did not return an object");
  assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}. Body: ${res.body}`);
  assert(typeof res.body === "string", "Expected string body");

  const parsed = JSON.parse(res.body);

  assert(typeof parsed.emotion === "string", "emotion must be a string");
  assert(Array.isArray(parsed.themes), "themes must be an array");
  assert(Array.isArray(parsed.reflection_prompts), "reflection_prompts must be an array");
  assert(parsed.reflection_prompts.length === 3, "reflection_prompts must contain exactly 3 items");
  assert(typeof parsed.summary === "string", "summary must be a string");

  console.log("Smoke test passed. Sample output:");
  console.log(JSON.stringify(parsed, null, 2));
}

run().catch((err) => {
  console.error("Smoke test failed:", err.message);
  process.exit(1);
});

