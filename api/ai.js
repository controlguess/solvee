const RATE_LIMIT = 20; // requests
const WINDOW_MS = 60 * 1000; // 1 minute

let ipStore = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const data = ipStore.get(ip) || { count: 0, start: now };

  if (now - data.start > WINDOW_MS) {
    data.count = 0;
    data.start = now;
  }

  data.count++;
  ipStore.set(ip, data);

  return data.count <= RATE_LIMIT;
}

function isMathSafe(input) {
  return /^[0-9xXyYzZ+\-*/^().=\s]+$/.test(input);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;

  //if (origin !== "https://usesolvee.vercel.app") {
  //  return res.status(403).json({ error: "Forbidden" });
  //}

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const { prompt } = req.query;

  //if (!prompt || !isMathSafe(prompt)) {
  //  return res.status(400).json({ error: "Invalid math input" });
  //}

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": "AIzaSyAS12CPzfEj0I6d6sWflVZ9dHp6p4uKBrU",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are Solvee, an ai chat bot working alongside Google Gemini. Your goal is to talk as genuine and lifelike as possible, including things like 'bro' 'yo' 'seeya' and more.",
                  text: `${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No result";

    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: "Failed!" });
  }
}
