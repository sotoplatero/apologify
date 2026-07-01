import Anthropic from '@anthropic-ai/sdk';

// Apology generation runs on Claude Haiku 4.5 — best-in-class empathetic prose
// at low cost and fast latency, and off the (separate) OpenAI account. The model
// is defined here; do not change it without the owner's say-so.
const MODEL = 'claude-haiku-4-5';

const apiKey = import.meta.env.ANTHROPIC_API_KEY;
const client = new Anthropic({ apiKey });

/**
 * Single-turn completion for the apology generator. Returns the model's text
 * (the caller parses the JSON it asked for), or null.
 */
export async function callLLM({ systemPrompt, userPrompt }) {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return text || null;
  } catch (error) {
    console.error('Error calling Anthropic:', error);
    throw error;
  }
}
