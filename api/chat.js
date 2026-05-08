const OPENAI_URL = "https://api.openai.com/v1/responses";

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.GPT_API;
}

function extractText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if ((content.type === "output_text" || content.type === "text") && content.text) {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY or GPT_API environment variable." });
  }

  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Missing prompt." });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const upstream = await fetch(OPENAI_URL, {
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
      return res.status(upstream.status).json({ error: data.error?.message || "OpenAI request failed." });
    }

    return res.status(200).json({ answer: extractText(data) || "I could not generate a response.", model });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown backend error." });
  }
};
