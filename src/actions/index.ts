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
      relationship: z.string().min(1).max(100),
      recipientName: z.string().max(60).nullish().transform((v) => (v ? v.trim() : undefined)),
      senderName: z.string().max(80).nullish().transform((v) => (v ? v.trim() : undefined)),
      audience: z.enum(['person', 'public']).default('person'),
      context: z.string().transform(normalizeContext).pipe(
        z.string().min(20, "Please describe what happened (at least 20 characters)").max(1000)
          .refine((val) => !urlPattern.test(val), "URLs are not allowed")
      ),
      tone: z.string().min(1).max(50),
      theme: z.string().min(1).max(40),
    }),
    handler: async (input, context) => {
      try {
        const userId = context.locals.user?.id ?? null;
        // Always created as a draft; going public happens via the publish step.
        const visibility: 'private' | 'public' = 'private';

        const { title, message } = await generateApologyContent({
          relationship: input.relationship,
          recipientName: input.recipientName,
          audience: input.audience,
          tone: input.tone,
          context: input.context,
        });
        const slug = buildApologySlug({ recipientName: input.recipientName, recipient: input.relationship, title });
        const theme = isPremiumTheme(input.theme) ? 'classic' : input.theme;
        try {
          await saveApologyPage({
            slug,
            recipient: input.relationship,
            recipientName: input.recipientName ?? null,
            senderName: input.senderName ?? null,
            audience: input.audience,
            visibility,
            ownerId: userId ?? null,
            message,
            title,
            theme,
            tone: input.tone,
          });
          return { slug, title, visibility, saved: true };
        } catch (dbError) {
          console.error('Failed to save apology page:', dbError);
          return { slug, title, visibility, saved: false };
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
    input: z.object({ slug: z.string().min(3).max(90) }),
    handler: async (input, context) => {
      const userId = context.locals.user?.id;
      if (!userId) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'You must be signed in to publish.' });
      }
      const published = await runPublish(input.slug, userId);
      if (!published) {
        throw new ActionError({ code: 'FORBIDDEN', message: 'This page can no longer be published.' });
      }
      return { published: true, slug: input.slug };
    },
  }),
}

async function generateApologyContent(input: {
  relationship: string; recipientName?: string; audience: 'person' | 'public'; tone: string; context: string;
}): Promise<{ title: string; message: string }> {
  const { relationship, recipientName, audience, tone, context } = input;
  const isPublic = audience === 'public';
  const who = isPublic
    ? `the public / our customers`
    : (recipientName ? `${relationship} named ${recipientName}` : relationship);

  const systemPrompt = isPublic
    ? `You write sincere public apology statements for organizations. The statement will be published on a public web page. Take clear accountability, avoid corporate weasel words and non-apologies ("we're sorry if anyone was offended"), state concrete corrective actions. No greeting, no signature.`
    : `You write short, sincere, heartfelt personal apology messages meant to be read on a personal web page shared privately with one recipient. Write like a real person, never corporate. No greeting line, no signature.`;

  const userPrompt = `Write an apology to ${who}.
Tone: ${tone}.
What happened: ${context}

Respond with a valid JSON object (no markdown fences) with exactly two keys:
- "title": a concise 4-8 word summary of the reason (e.g. "Forgetting Our Anniversary", "Service Outage Apology"). Do NOT include the recipient.
- "message": ${isPublic ? '120-200 words, 2-3 short paragraphs' : '90-160 words, 2 short paragraphs'} separated by blank lines. Own the mistake, show understanding of the impact, ${isPublic ? 'state concrete corrective steps' : 'be warm and specific'}. No "Dear ..." greeting and no sign-off/signature.

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

