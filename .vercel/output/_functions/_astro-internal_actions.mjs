import './chunks/_astro_actions_BEReH5zP.mjs';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { d as defineAction, o as objectType, s as stringType } from './chunks/server_tEZWD5Ue.mjs';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://apologify.com", "SSR": true};
function getApiKeyFromEnvFile() {
  try {
    const envContent = readFileSync(".env", "utf8");
    const lines = envContent.split("\n");
    const openaiLine = lines.find((line) => line.trim().startsWith("OPENAI_API_KEY="));
    if (openaiLine) {
      return openaiLine.split("=")[1].trim();
    }
  } catch (error) {
    console.error("Error reading .env file:", error);
  }
  return null;
}
const apiKey = Object.assign(__vite_import_meta_env__, {}).OPENAI_API_KEY || getApiKeyFromEnvFile();
const openai = new OpenAI({
  apiKey
});
async function callOpenAIChatCompletion({
  systemPrompt,
  userPrompt
}) {
  console.log("Using API Key:", apiKey);
  console.log("Source: import.meta.env =", Object.assign(__vite_import_meta_env__, {}).OPENAI_API_KEY ? "SET" : "NOT SET");
  console.log("Source: .env file =", getApiKeyFromEnvFile() ? "SET" : "NOT SET");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: systemPrompt
      }, {
        role: "user",
        content: userPrompt
      }],
      temperature: 0.8,
      top_p: 1
    });
    const response = completion.choices[0].message.content;
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error al llamar a OpenAI Chat Completion:", error);
    throw error;
  }
}

const server = {
  createLetter: defineAction({
    accept: "form",
    input: objectType({
      relationship: stringType(),
      context: stringType(),
      tone: stringType()
    }),
    handler: async (input) => {
      if (!input.relationship || !input.context || !input.tone) {
        throw new Error("Missing required input fields");
      }
      const letter = await generateLetter(input);
      return {
        letter
      };
    }
  })
};
async function generateLetter(input) {
  const {
    relationship,
    context,
    tone
  } = input;
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
  const letter = await callOpenAIChatCompletion({
    systemPrompt,
    userPrompt
  });
  return letter;
}

export { server };
