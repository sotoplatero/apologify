import OpenAI from 'openai';
import { readFileSync } from 'fs';

// Function to get API key from .env file as fallback
function getApiKeyFromEnvFile() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    const openaiLine = lines.find(line => line.trim().startsWith('OPENAI_API_KEY='));
    if (openaiLine) {
      return openaiLine.split('=')[1].trim();
    }
  } catch (error) {
    console.error('Error reading .env file:', error);
  }
  return null;
}

// Get API key with fallback to .env file
const apiKey = import.meta.env.OPENAI_API_KEY || getApiKeyFromEnvFile();

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function callOpenAIChatCompletion({ systemPrompt, userPrompt}) {
  
  console.log('Using API Key:', apiKey);
  console.log('Source: import.meta.env =', import.meta.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
  console.log('Source: .env file =', getApiKeyFromEnvFile() ? 'SET' : 'NOT SET');
  
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
