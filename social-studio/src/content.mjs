import Anthropic from "@anthropic-ai/sdk";
import { apologyHeading } from "./text.mjs";

const MODEL = "claude-haiku-4-5-20251001";

export function normalizeContent(raw, recipient) {
  const r = raw || {};
  const caps = r.captions || {};
  const x = String(caps.x || caps.default || "").slice(0, 280);
  return {
    title: String(r.title || "An apology").trim(),
    heading: apologyHeading(recipient),
    paragraphs: Array.isArray(r.paragraphs) ? r.paragraphs.map(String).filter(Boolean) : [],
    senderName: String(r.senderName || "").trim(),
    captions: {
      default: String(caps.default || "").trim(),
      x,
      linkedin: String(caps.linkedin || caps.default || "").trim(),
      hashtags: Array.isArray(caps.hashtags) ? caps.hashtags.map(String) : [],
    },
  };
}

export async function generateContent({ recipient, situation, tone, lang = "en" }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `You write marketing content for Apologify (apologify.com), an app that turns an apology into a beautiful shareable web page. This apology is the hero of a marketing image, so it must read as a REAL apology — the kind that makes a stranger stop scrolling.

Write, in ${lang}, a sincere apology that will be displayed ON a designed card, plus social captions promoting Apologify.

Context:
- Recipient: ${recipient}
- What happened: ${situation}
- Tone: ${tone}

CRITICAL — the apology must be REAL, not generic:
- Tell the actual story. Invent one concrete, specific incident from "what happened": a moment, a place, a thing that was said or done, what the recipient did in response. Specific beats vague every time.
- Own the wrong plainly. Name exactly what you did and that it was your fault — no "I'm sorry you felt…", no excuses, no blaming circumstances. Take responsibility for the intent and the impact.
- Name the harm it caused the recipient (how it landed for them), concretely.
- End with real accountability: a specific, believable next step — not "I'll do better" clichés.
- Forbidden: platitudes ("you mean everything to me", "I'll try harder"), throwaway lines, greeting lines (no "Dear X"). Every sentence must carry weight.
- Length: 3 substantial paragraphs. It should feel like a letter someone actually agonized over.

Return ONLY valid JSON, no prose, with this exact shape:
{
  "title": "short, striking headline for the card (max 6 words, no name, evokes the specific wrong)",
  "paragraphs": ["3 substantial paragraphs of the apology body — specific, accountable, no greeting line"],
  "senderName": "a plausible first name to sign with",
  "captions": {
    "default": "Instagram/Facebook caption ending with a CTA to write your own at apologify.com",
    "x": "tweet under 280 chars with CTA + apologify.com",
    "linkedin": "slightly more polished caption with CTA + apologify.com",
    "hashtags": ["4-5 relevant hashtags"]
  }
}`;
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1400,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Model did not return JSON:\n${text}`);
  return normalizeContent(JSON.parse(match[0]), recipient);
}
