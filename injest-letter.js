import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { recipients, contextsByRecipient, tones } from './src/lib/apologyData.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateApologyLetter() {
  const recipient = getRandomElement(recipients);
  const tone = getRandomElement(tones);
  const context = getRandomElement(contextsByRecipient[recipient.value]);

  const prompt = `Generate an apology note with the following details:
  Tone: ${tone.value}
  Recipient: ${recipient.label}
  Context: ${context}
  
  The letter should be sincere and address the situation appropriately. Do not include the header.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const letter = completion.choices[0].message.content;

  return {
    tone: tone.value,
    recipient: recipient.value,
    context,
    letter,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function generateAndSaveLetter() {
  const letter = await generateApologyLetter();
  
  const baseOutputDir = path.join(process.cwd(), 'src', 'content', 'letters');
  const recipientDir = path.join(baseOutputDir, letter.recipient);
  await fs.mkdir(recipientDir, { recursive: true });

  const timestamp = new Date().getTime();
  const fileName = `${letter.tone}-${timestamp}.json`;
  await fs.writeFile(
    path.join(recipientDir, fileName),
    JSON.stringify(letter, null, 2)
  );

  console.log(`Generated apology letter saved in ${path.join(recipientDir, fileName)}`);
}

generateAndSaveLetter().catch(console.error);
