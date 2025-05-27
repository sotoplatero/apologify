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
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      top_p: 1,
    });

    const response = completion.choices[0].message.content;
    console.log(response);
    return response;

  } catch (error) {
    console.error('Error al llamar a OpenAI Chat Completion:', error);
    throw error;
  }
}
