import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { callOpenAIChatCompletion } from '../lib/server/openai';
import { saveApologyPage, publishApologyPage as runPublish } from '../lib/apologyPages';
import { buildApologySlug } from '../lib/slug.js';
import { isPremiumTheme } from '../lib/themes.js';

const urlPattern = /https?:\/\/|www\.|\.com\b|\.net\b|\.org\b|\.io\b|\.co\b|\.me\b|\.info\b|\.xyz\b|\.dev\b|\.app\b/i;

/**
 * Normalize context text: strip HTML, special chars, collapse whitespace.
 * Keeps letters, numbers, basic punctuation, and accented characters.
 */
function normalizeContext(text: string): string {
  let result = text
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/&[a-z]+;/gi, ' ')        // strip HTML entities
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // strip emojis
    .replace(/[^\w\s.,!?;:'"()\-\u00C0-\u024F]/g, '') // keep letters, digits, basic punctuation, accented chars
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim();

  // Normalize ALL CAPS to sentence case
  const letters = result.replace(/[^a-zA-Z\u00C0-\u024F]/g, '');
  if (letters.length > 0 && letters === letters.toUpperCase()) {
    result = result.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00E0-\u024F])/g, (_, sep, ch) => sep + ch.toUpperCase());
  }

  return result;
}

export const server = {
  createApologyPage: defineAction({
    accept: 'form',
    input: z.object({
      // "A quién" — free text (a name like "Mia", or a phrase like "our customers").
      relationship: z.string().min(1, "Tell us who this is for").max(100),
      // "Firma" — who is apologizing (optional).
      senderName: z.string().max(80).nullish().transform((v) => (v ? v.trim() : undefined)),
      context: z.string().transform(normalizeContext).pipe(
        z.string().min(20, "Please describe what happened (at least 20 characters)").max(1000)
          .refine((val) => !urlPattern.test(val), "URLs are not allowed")
      ),
      tone: z.string().min(1).max(50),
    }),
    handler: async (input, context) => {
      try {
        const userId = context.locals.user?.id ?? null;

        const { title, message } = await generateApologyContent({
          relationship: input.relationship,
          senderName: input.senderName,
          tone: input.tone,
          context: input.context,
        });
        const slug = buildApologySlug({ recipientName: input.relationship, recipient: input.relationship, title });
        try {
          await saveApologyPage({
            slug,
            recipient: input.relationship,
            recipientName: input.relationship,
            senderName: input.senderName ?? null,
            audience: 'person',
            // Always created as a private draft; the theme is finalized at publish.
            visibility: 'private',
            ownerId: userId ?? null,
            message,
            title,
            theme: 'classic',
            tone: input.tone,
          });
          return { slug, title, message, saved: true };
        } catch (dbError) {
          console.error('Failed to save apology page:', dbError);
          return { slug, title, message, saved: false };
        }
      } catch (error) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create your apology page. Please try again.',
        });
      }
    },
  }),

  publishApologyPage: defineAction({
    input: z.object({ slug: z.string().min(3).max(90), theme: z.string().max(40).optional() }),
    handler: async (input, context) => {
      const userId = context.locals.user?.id;
      if (!userId) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'You must be signed in to publish.' });
      }
      // Premium themes downgrade to classic until paid (paywall: future phase).
      const theme = input.theme
        ? (isPremiumTheme(input.theme) ? 'classic' : input.theme)
        : undefined;
      const published = await runPublish(input.slug, userId, theme);
      if (!published) {
        throw new ActionError({ code: 'FORBIDDEN', message: 'This page can no longer be published.' });
      }
      return { published: true, slug: input.slug };
    },
  }),
}

async function generateApologyContent(input: {
  relationship: string; senderName?: string; tone: string; context: string;
}): Promise<{ title: string; message: string }> {
  const { relationship, senderName, tone, context } = input;

  const systemPrompt = `You are the most thoughtful apology writer in the world. Your apologies feel personal, specific and genuinely human — never generic, never templated, never corporate filler.

Read the situation closely and infer the real relationship and register from BOTH who it is for and what happened:
- a partner or someone loved → intimate, tender, vulnerable
- a friend → warm, honest, informal
- a boss, client or the public/customers → respectful, accountable, composed
Choose the right voice and level of intimacy from those clues. If the recipient is described vaguely, look in the situation text for who is really being addressed.

How to write:
- Be specific to THIS situation — reference what actually happened. No vague "I'm sorry for my actions" filler.
- Take real accountability and show you understand how it felt for them. Never a non-apology ("sorry if you were upset").
- Keep it easy to read: short paragraphs with breathing room (usually 2–4 short paragraphs). Never a wall of text.
- No greeting line ("Dear …") and no sign-off/signature — those are added around your text.

Formatting — Markdown, used with restraint and only when it genuinely adds feeling:
- You MAY use **bold** for the core promise or the heart of the apology, and *italics* for a tender or emphasized phrase — a light touch at most.
- Emojis: only for warm, casual or romantic registers, at most one or two, and only where they truly belong.
- For formal or professional apologies: NO emojis and essentially no decorative formatting — clean, dignified prose.
- Never add formatting just to use it. If plain prose reads better, write plain prose.`;

  const userPrompt = `Write an apology.
For (the recipient): ${relationship}
Tone: ${tone}${senderName ? `\nFrom (who is apologizing): ${senderName}` : ''}
What happened (the sender's own words): ${context}

Respond with a valid JSON object (no markdown fences) with exactly two keys:
- "title": a concise 4-8 word summary of the reason (e.g. "Forgetting Our Anniversary", "Service Outage Apology"). Do NOT include the recipient and do NOT use quotes.
- "message": the apology body in Markdown, 2–4 short paragraphs separated by blank lines, following the formatting rules above. No greeting and no signature.

Respond with the JSON now:`;

  const response = await callOpenAIChatCompletion({ systemPrompt, userPrompt });
  if (!response) throw new Error('Empty response from OpenAI');
  try {
    const cleaned = response.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.title && parsed.message) return { title: String(parsed.title), message: String(parsed.message) };
  } catch (_) { /* fall through */ }
  const fallbackTitle = context.length > 50 ? context.slice(0, 47) + '...' : context;
  return { title: fallbackTitle, message: response.trim() };
}

