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

    const systemPrompt = `You are an apology letter generator. You are given a relationship, context, and tone. You need to generate a letter for the recipient.`;
    const userPrompt = `Write a apology letter without any headers or footers for the recipient ${relationship} using a tone that is ${tone} for the following context: ${context}.`;      

    const letter = await callOpenAIChatCompletion({ systemPrompt, userPrompt });
    
    return letter;
}

