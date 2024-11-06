import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { recipients, contextsByRecipient, tones } from './src/lib/apologyData.js';
import slugify from 'slugify';
import { removeStopwords } from 'stopword';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createOptimizedSlug(text) {
  const words = text.toLowerCase().split(/\s+/);
  const filteredWords = removeStopwords(words);
  const filteredText = filteredWords.join(' ');
  return slugify(filteredText);
}

async function getRecipientWithFewestLetters() {
  const baseOutputDir = path.join(process.cwd(), 'src', 'content', 'letters');
  let recipientWithFewestLetters = null;
  let fewestLettersCount = Infinity;

  for (const recipient of recipients) {
    const recipientDir = path.join(baseOutputDir, recipient.value);
    try {
      const files = await fs.readdir(recipientDir);
      const lettersCount = files.length;
      if (lettersCount < fewestLettersCount) {
        fewestLettersCount = lettersCount;
        recipientWithFewestLetters = recipient;
      }
    } catch (error) {
      // Directory doesn't exist, treat as zero letters
      if (fewestLettersCount > 0) {
        fewestLettersCount = 0;
        recipientWithFewestLetters = recipient;
      }
    }
  }

  return recipientWithFewestLetters;
}

async function generateApologyLetter() {
  const recipient = await getRecipientWithFewestLetters();
  const tone = getRandomElement(tones);
  const context = getRandomElement(contextsByRecipient[recipient.value]);
  const slug = createOptimizedSlug(context);

  const baseOutputDir = path.join(process.cwd(), 'src', 'content', 'letters');
  const recipientDir = path.join(baseOutputDir, recipient.value);
  const filePath = path.join(recipientDir, `${slug}.json`);

  let existingData;
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    existingData = JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist, create new data structure
    existingData = {
      tone: tone.value,
      recipient: recipient.value,
      context,
      letters: []
    };
  }

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

  existingData.letters.push(letter);

  return { filePath, data: existingData };
}

async function generateAndSaveLetter() {
  const { filePath, data } = await generateApologyLetter();
  
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  console.log(`Generated apology letter saved in ${filePath}`);
}

generateAndSaveLetter().catch(console.error);
