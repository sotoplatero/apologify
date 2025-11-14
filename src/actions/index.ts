import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { callOpenAIChatCompletion } from '../lib/server/openai';
import { saveGeneratedLetter } from '../lib/db';
import slugify from 'slugify';

export const server = {
  createLetter: defineAction({
    accept: 'form',
    input: z.object({
        relationship: z.string()
          .min(1, "Relationship is required")
          .max(100, "Relationship is too long"),
        context: z.string()
          .min(10, "Context must be at least 10 characters")
          .max(1000, "Context is too long"),
        tone: z.string()
          .min(1, "Tone is required")
          .max(50, "Tone is too long"),
     }),
    handler: async (input) => {
        try {
            const letter = await generateLetter(input);
            if (!letter) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to generate letter content'
                });
            }

            // Generate a unique slug for the letter
            const baseSlug = slugify(input.context.substring(0, 50), {
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
                    letter: letter,
                    slug: slug
                });

                return {
                    letter,
                    slug,
                    recipient: input.relationship,
                    saved: true
                };
            } catch (dbError) {
                console.error('Failed to save letter to database:', dbError);
                // Still return the letter even if DB save fails
                return {
                    letter,
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

async function generateLetter(input: { relationship: string, context: string, tone: string }) {
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

Write letters that sound human, not like templates. Use natural language that matches how real people communicate in that type of relationship.`;

    const userPrompt = `Write a heartfelt apology letter for the following situation:

**Recipient**: ${relationship}
**Tone**: ${tone}
**Situation**: ${context}

Requirements:
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

Write the letter now:`;

    const letter = await callOpenAIChatCompletion({ systemPrompt, userPrompt });
    return letter;
}

