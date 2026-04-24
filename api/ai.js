export default async function handler(req, res) {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  async function askOpenRouter() {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer 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`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "inclusionai/ling-2.6-flash", // valid example
      messages: [
        { role: "system", content: "You are Solvee, a chill, human-like AI. Talk casually like 'yo', 'bro', etc." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await r.json();
  console.log("OpenRouter:", data);

  return data.choices?.[0]?.message?.content;
}

  async function askGroq() {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer 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`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await r.json();
  console.log("Groq:", data);

  return data.choices?.[0]?.message?.content;
}

  try {
    let result = await askOpenRouter();

    if (!result) throw new Error("OpenRouter failed");

    return res.status(200).json({ result });
  } catch (e) {
    try {
      const fallback = await askGroq();

      if (!fallback) throw new Error("Groq failed");

      return res.status(200).json({ result: fallback });
    } catch {
      return res.status(500).json({ error: "Both providers failed" });
    }
  }
}
