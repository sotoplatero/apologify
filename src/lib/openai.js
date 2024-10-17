import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAIChatCompletion({ systemPrompt, userPrompt}) {


  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log(response);
    return response;

  } catch (error) {
    console.error('Error al llamar a OpenAI Chat Completion:', error);
    throw error;
  }
}
