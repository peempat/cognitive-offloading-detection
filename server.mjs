import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const openaiModel = process.env.OPENAI_MODEL || "gpt-5.5";

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
              "You analyze attention and cognitive offloading signals for a local focus-monitor prototype. Return only compact JSON. This is behavioral screening, not diagnosis. Do not claim ADHD or medical certainty. Use the requested language.",
          },
          {
            role: "user",
            content: JSON.stringify({
              requiredShape: {
                signal: "Low | Moderate | Elevated | High",
                confidence: "0-1 number",
                flags: ["short marker strings"],
                summary: "2-4 sentences",
                recommendation: "1 practical next step",
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
