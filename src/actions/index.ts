import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { callOpenAIChatCompletion } from '../lib/server/openai';
import { saveGeneratedLetter } from '../lib/db';
import slugify from 'slugify';

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
  createLetter: defineAction({
    accept: 'form',
    input: z.object({
        relationship: z.string()
          .min(1, "Relationship is required")
          .max(100, "Relationship is too long"),
        context: z.string()
          .transform(normalizeContext)
          .pipe(
            z.string()
              .min(20, "Context must be at least 20 characters")
              .max(1000, "Context is too long")
              .refine((val) => !urlPattern.test(val), "URLs are not allowed in the context")
          ),
        tone: z.string()
          .min(1, "Tone is required")
          .max(50, "Tone is too long"),
     }),
    handler: async (input) => {
        try {
            const result = await generateLetter(input);
            if (!result) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to generate letter content'
                });
            }

            // Generate a unique slug from the title
            const baseSlug = slugify(result.title.substring(0, 60), {
              lower: true,
              strict: true
            });
            const timestamp = Date.now();
            const slug = `${baseSlug}-${timestamp}`;

            // Save to database
            try {
                await saveGeneratedLetter({
                    recipient: input.relationship,
                    context: input.context,
                    tone: input.tone,
                    letter: result.letter,
                    slug: slug,
                    title: result.title
                });

                return {
                    letter: result.letter,
                    title: result.title,
                    slug,
                    recipient: input.relationship,
                    saved: true
                };
            } catch (dbError) {
                console.error('Failed to save letter to database:', dbError);
                // Still return the letter even if DB save fails
                return {
                    letter: result.letter,
                    title: result.title,
                    recipient: input.relationship,
                    saved: false
                };
            }
        } catch (error) {
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error instanceof Error ? error.message : 'Failed to generate letter. Please try again.'
            });
        }
    },
  })
}

async function generateLetter(input: { relationship: string, context: string, tone: string }): Promise<{ title: string; letter: string }> {
    const { relationship, context, tone } = input;

    const systemPrompt = `You are an experienced relationship counselor and communication expert with 20+ years of experience helping people navigate difficult conversations and repair relationships.

Your expertise includes:
- Understanding emotional dynamics in different types of relationships (professional, romantic, family, friendship)
- Crafting apologies that rebuild trust and demonstrate genuine accountability
- Adapting communication style to match the recipient's relationship and emotional context
- Writing with authenticity, avoiding clichés and generic corporate language

Your role is to help people write sincere, effective apology letters that:
1. Take full responsibility without deflecting or making excuses
2. Show genuine understanding of how their actions impacted the other person
3. Express authentic remorse (not just regret at being caught)
4. Offer specific steps for making amends or preventing future occurrences
5. Respect the recipient's need for time and space to process

Write letters that sound human, not like templates. Use natural language that matches how real people communicate in that type of relationship.

IMPORTANT: You MUST respond with a valid JSON object (no markdown fences, no extra text). The JSON must have exactly two keys: "title" and "letter".`;

    const userPrompt = `Write a heartfelt apology letter for the following situation:

**Recipient**: ${relationship}
**Tone**: ${tone}
**Situation**: ${context}

Requirements:
- Respond with a JSON object with two keys:
  - "title": A concise 5-10 word summary of the apology reason in gerund/noun form (e.g. "Forgetting Your Birthday", "Being Late to the Meeting", "Breaking a Promise About Our Vacation"). Do NOT include the recipient in the title.
  - "letter": The full apology letter text.
- Write ONLY the letter content (no headers like "Dear...", no signature/closing like "Sincerely, [Name]")
- Use ${tone === 'formal' ? 'professional and respectful' : tone === 'casual' ? 'warm and conversational' : 'balanced and sincere'} language appropriate for a ${relationship}
- Start directly with the apology, acknowledging what happened
- Show that you understand the impact of your actions on them specifically
- Take full ownership without making excuses or shifting blame
- Be specific about what you're apologizing for (based on the context provided)
- If appropriate, mention concrete steps to make things right or prevent it from happening again
- Keep it concise (200-300 words) - brevity shows respect for their time
- End with an opening for dialogue or reconciliation, without pressuring them
- Sound like a real person writing to someone they care about, not a corporate PR statement

Adapt your language to the relationship:
- **Professional** (boss/colleague/client): Maintain professionalism while being human
- **Romantic** (partner/spouse): Be vulnerable and emotionally present
- **Family**: Balance respect with familial warmth
- **Friend**: Be genuine and conversational

Respond with the JSON now:`;

    const response = await callOpenAIChatCompletion({ systemPrompt, userPrompt });

    if (!response) {
        throw new Error('Empty response from OpenAI');
    }

    // Try to parse JSON response
    try {
        // Strip markdown code fences if present
        const cleaned = response.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.title && parsed.letter) {
            return { title: parsed.title, letter: parsed.letter };
        }
    } catch (e) {
        console.warn('Failed to parse JSON response from OpenAI, using fallback:', e);
    }

    // Fallback: use the response as the letter and truncate context as title
    const fallbackTitle = context.length > 60 ? context.substring(0, 57) + '...' : context;
    return { title: fallbackTitle, letter: response };
}

