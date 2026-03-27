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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const { handler } = require("./index");

async function run() {
  const journal =
    process.argv.slice(2).join(" ") ||
    "Today I felt a little stressed, but I made progress and feel hopeful.";

  const event = {
    httpMethod: "POST",
    body: JSON.stringify({ journal }),
  };

  const result = await handler(event);
  console.log("Lambda response:");
  console.log(result);
}

run().catch((err) => {
  console.error("Local invoke failed:", err);
  process.exit(1);
});

