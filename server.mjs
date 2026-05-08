import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, isAbsolute, join, normalize, relative, resolve } from "node:path";

const root = resolve(process.cwd());

function unquoteEnvValue(value) {
  let next = value.trim();
  while (
    (next.startsWith('"') && next.endsWith('"')) ||
    (next.startsWith("'") && next.endsWith("'"))
  ) {
    next = next.slice(1, -1).trim();
  }
  return next;
}

function loadLocalEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = unquoteEnvValue(trimmed.slice(separator + 1));
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const openaiModel = process.env.OPENAI_MODEL || "gpt-5.5";
const logFile = resolve(process.env.FOCUS_LOG_FILE || join(root, "data", "focus-logs.json"));

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 128_000) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function readLogs() {
  try {
    return JSON.parse(await readFile(logFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeLogs(logs) {
  await mkdir(dirname(logFile), { recursive: true });
  await writeFile(logFile, JSON.stringify(logs.slice(-1000), null, 2), "utf8");
}

async function saveFocusLog(request, response) {
  try {
    const payload = await readJsonBody(request);
    const logs = await readLogs();
    const entry = {
      at: new Date().toISOString(),
      ...payload,
    };
    logs.push(entry);
    await writeLogs(logs);
    sendJson(response, 200, { ok: true, entry, total: logs.length });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Unable to save log" });
  }
}

async function listFocusLogs(response) {
  sendJson(response, 200, { logs: await readLogs() });
}

function extractResponseText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function parseModelJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON");
    return JSON.parse(match[0]);
  }
}

async function analyzeBehavior(request, response) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 503, { error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: openaiModel,
        input: [
          {
            role: "system",
            content:
              "You are kamun, called กมล in Thai, a safe homework coach for children. Return only compact JSON. Use the requested language. If the child asks a calculation/arithmetic/math-solving question, do not give the final answer immediately; guide step-by-step with one small hint, one question, or one next action at a time. For coding, guide the child to reason and debug step-by-step before giving a full solution. For non-calculation questions in other subjects, answer directly when asked. If the child asks for a summary, main idea, definition, or key point, answer briefly and focus on the important idea. Keep every response warm, age-appropriate, and easy to read. Do not request personal data. If the child asks for unsafe, adult, medical, legal, or private topics, gently redirect to a trusted adult.",
          },
          {
            role: "user",
            content: JSON.stringify({
              requiredShape: {
                signal: "Low | Moderate | Elevated | High",
                confidence: "0-1 number",
                flags: ["short marker strings"],
                summary: "2-4 child-friendly sentences; for calculations guide step-by-step without the final answer first; for summaries/key ideas answer briefly",
                recommendation: "1 small next step, question, or follow-up hint",
              },
              observation: payload,
            }),
          },
        ],
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
      }),
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      sendJson(response, apiResponse.status, {
        error: result.error?.message || "OpenAI request failed",
      });
      return;
    }

    sendJson(response, 200, {
      model: result.model || openaiModel,
      analysis: parseModelJson(extractResponseText(result)),
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Behavior analysis failed" });
  }
}

createServer(async (request, response) => {
  if (request.method === "POST" && request.url?.startsWith("/api/behavior-analysis")) {
    await analyzeBehavior(request, response);
    return;
  }

  if (request.method === "POST" && request.url?.startsWith("/api/focus-log")) {
    await saveFocusLog(request, response);
    return;
  }

  if (request.method === "GET" && request.url?.startsWith("/api/focus-logs")) {
    await listFocusLogs(response);
    return;
  }

  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = resolve(join(root, requested === "/" ? "index.html" : requested));

  const outsideRoot = relative(root, filePath).startsWith("..") || isAbsolute(relative(root, filePath));
  if (outsideRoot || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": types[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host);
