import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { callOpenAIChatCompletion } from '../lib/openai';

export const server = {
  createLetter: defineAction({
    accept: 'form',
    input: z.object({ 
        relationship: z.string(),
        context: z.string(),
        tone: z.string(),
     }),
    handler: async (input) => {
        if (!input.relationship || !input.context || !input.tone) {
            throw new Error('Missing required input fields');
        }
        const letter = await generateLetter(input);
        return { letter };
    },
  })
}

async function generateLetter(input: { relationship: string, context: string, tone: string }) {
    const { relationship, context, tone } = input;

    const systemPrompt = `You are a professional apology letter assistant. 
    Your task is to craft emotionally appropriate, well-structured apology letters based on three inputs: the recipient relationship, the context of the apology, and the desired tone. 
    Your goal is to help the user express their regret clearly and respectfully, in a natural and sincere way, suitable for direct sending.`;

    const userPrompt = `Write a complete apology letter without headers, footers, or formatting tags. 
    The recipient is a ${relationship}. The desired tone is ${tone}. 
    The context for the apology is: ${context}.
    
    Make the letter concise but sincere. It should include:
    - A clear acknowledgement of the mistake
    - A sense of responsibility without over-explaining
    - A short, respectful closing that invites resolution or understanding.`;    
    

    const letter = await callOpenAIChatCompletion({ systemPrompt, userPrompt });
    
    return letter;
}

