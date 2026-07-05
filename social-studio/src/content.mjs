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
  const prompt = `You write marketing content for Apologify (apologify.com), an app that turns an apology into a beautiful shareable web page.

Write, in ${lang}, a short sincere apology that will be displayed ON a designed card image, plus social captions promoting Apologify.

Context:
- Recipient: ${recipient}
- What happened: ${situation}
- Tone: ${tone}

Return ONLY valid JSON, no prose, with this exact shape:
{
  "title": "short evocative headline for the card (max 8 words, no name)",
  "paragraphs": ["2 short paragraphs of the apology body; heartfelt, specific, no greeting line"],
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
    max_tokens: 900,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Model did not return JSON:\n${text}`);
  return normalizeContent(JSON.parse(match[0]), recipient);
}
