import OpenAI from 'openai';

// Get API key with fallback to .env file
const apiKey = import.meta.env.OPENAI_API_KEY

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function callOpenAIChatCompletion({ systemPrompt, userPrompt }) {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      // gpt-5-mini is a reasoning model; without this it "thinks" before every
      // reply, which is the main latency source for a simple text task. 'minimal'
      // keeps it fast (near non-reasoning speed). This tunes the model, it does
      // NOT change which model is used.
      reasoning_effort: 'minimal',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const response = completion.choices[0].message.content;
    return response;

  } catch (error) {
    console.error('Error al llamar a OpenAI Chat Completion:', error);
    throw error;
  }
}
