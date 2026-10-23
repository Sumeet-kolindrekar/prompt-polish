// Background service worker: the only place that talks to the API.
// The content script sends the rough prompt here; we return { improved, why }.

const DEFAULT_MODEL = "claude-haiku-5-5";

const SYSTEM_PROMPT = `You are a prompt editor. The user will give you a rough prompt they plan to send to an AI assistant.
Rewrite it so it is clear, specific, and gives the AI the context it needs.

Rules:
- Keep the user's original intent and voice. Do not add goals they did not ask for.
- Do NOT answer the prompt. Only rewrite it.
- Add helpful structure when useful: the goal, relevant context, constraints, and the desired output format.
- Keep it as short as it can be while still being clear.
- If a user profile is provided, weave in only the parts relevant to this prompt.

Respond with JSON only, no code fences, in exactly this shape:
{"improved": "<the rewritten prompt>", "why": "<one or two sentences on what you changed and why>"}`;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "IMPROVE") return;
  improvePrompt(msg.prompt)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((err) => sendResponse({ ok: false, error: err.message }));
  return true; // keep the message channel open for the async response
});

async function improvePrompt(rawPrompt) {
  const { apiKey, profile, model } = await chrome.storage.local.get([
    "apiKey",
    "profile",
    "model",
  ]);

  if (!apiKey) {
    throw new Error("No API key yet. Right-click the extension icon → Options to add one.");
  }

  const userMessage = profile?.trim()
    ? `User profile:\n${profile.trim()}\n\nRough prompt:\n${rawPrompt}`
    : `Rough prompt:\n${rawPrompt}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: model?.trim() || DEFAULT_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  return parseResult(text);
}

function parseResult(text) {
  // Strip code fences in case the model adds them anyway.
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.improved === "string" && parsed.improved.trim()) {
      return { improved: parsed.improved.trim(), why: String(parsed.why || "").trim() };
    }
  } catch (_) {
    // fall through
  }
  // Fallback: treat the whole reply as the improved prompt.
  return { improved: cleaned, why: "" };
}
