import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4174);

await loadDotEnv();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname === "/api/chat") {
      await handleChat(req, res);
      return;
    }

    const filePath = resolveStaticPath(url.pathname);
    if (!filePath) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
}).listen(port, () => {
  console.log(`Cognitive Debt Tracker running at http://localhost:${port}`);
});

async function loadDotEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;
  const text = await readFile(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

function resolveStaticPath(pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(decodeURIComponent(cleanPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalized);
  if (!filePath.startsWith(root) || !existsSync(filePath)) return null;
  return filePath;
}

async function handleChat(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readRequestJson(req);
  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    sendJson(res, 400, { error: "Missing prompt." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.GPT_API;
  if (!apiKey) {
    sendJson(res, 500, { error: "Missing OPENAI_API_KEY or GPT_API environment variable." });
    return;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are the AI answer surface inside Cognitive Debt Tracker. Answer helpfully and concisely. When useful, encourage the user to keep their hypothesis, criteria, or reasoning visible. Do not mention scoring internals."
            }
          ]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }]
        }
      ],
      max_output_tokens: 500
    })
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    sendJson(res, upstream.status, { error: data.error?.message || "OpenAI request failed." });
    return;
  }

  sendJson(res, 200, { answer: extractText(data) || "I could not generate a response.", model });
}

function extractText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if ((content.type === "output_text" || content.type === "text") && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

async function readRequestJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}
