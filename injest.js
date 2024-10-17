import fs from 'fs/promises';
import path from 'path';
import { callOpenAIChatCompletion } from './src/lib/openai.js';
import { prompts } from './src/lib/prompts.js';
import { patterns } from './src/lib/patterns.js';
import { removeStopwords } from 'stopword';

function createSlug(title) {
  const words = removeStopwords(title.toLowerCase().split(' '));
  return words.join('-').replace(/[^a-z0-9-]/g, '');
}

function selectRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function extractVariables(pattern) {
  return (pattern.match(/\{(\w+)\}/g) || []).map(v => v.slice(1, -1));
}

function selectVariables(variableNames, availableVariables) {
  return variableNames.reduce((acc, varName) => {
    if (availableVariables[varName]) {
      acc[varName] = selectRandomElement(availableVariables[varName]);
    }
    return acc;
  }, {});
}

function createTitle(pattern, variables) {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => variables[key]);
}

async function generateContent({title, pattern}) {
  console.log(pattern);
  try {
    if (!prompts[pattern]) {
      console.log(`No prompt found for pattern: "${pattern}". Skipping content generation.`);
      return null;
    }

    const systemPrompt = prompts[pattern] + "\n\nImportant: Provide the content directly in Markdown format. You can use code blocks within the content if necessary, but do not wrap the entire response in a code block.";
    
    const response = await callOpenAIChatCompletion({
      systemPrompt: systemPrompt,
      userPrompt: title,
    });

    if (!response) {
      console.error(`Received null response from OpenAI for title: "${title}"`);
      return null;
    }

    // Remove the outer code block if present
    const cleanedResponse = response.replace(/^```[\s\S]*?\n([\s\S]*)\n```$/s, '$1');

    return cleanedResponse.trim();
  } catch (error) {
    console.error(`Error generating content for title: "${title}"`, error);
    return null;
  }
}

async function contentExists(slug) {
  const dir = path.join(process.cwd(), 'src', 'content', slug);
  try {
    await fs.access(path.join(dir, 'index.md'));
    return true;
  } catch {
    return false;
  }
}

async function saveContent(content, title) {
  const slug = createSlug(title);
  const dir = path.join(process.cwd(), 'src', 'content', 'articles', slug);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, 'index.md');
  await fs.writeFile(filePath, content, 'utf-8');
  return { filePath, slug };
}

async function generateAndSaveContent() {
  let contentGenerated = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!contentGenerated && attempts < maxAttempts) {
    try {
      const selectedPattern = selectRandomElement(patterns.patterns);
      const variableNames = extractVariables(selectedPattern);
      const selectedVariables = selectVariables(variableNames, patterns.variables);
      const title = createTitle(selectedPattern, selectedVariables);
      const slug = createSlug(title);

      if (await contentExists(slug)) {
        console.log(`Content for "${title}" already exists. Trying another pattern...`);
        attempts++;
        continue;
      }

      const content = await generateContent({pattern: selectedPattern, title: title });
      if (!content) {
        console.log(`Failed to generate content for "${title}". Trying another pattern...`);
        attempts++;
        continue;
      }

      const { filePath } = await saveContent(content, title);

      console.log(`Content generated and saved in: ${filePath}`);
      console.log(`Title: ${title}`);
      console.log(`Selected pattern: ${selectedPattern}`);
      console.log(`Selected variables:`, selectedVariables);
      console.log(`Generated slug: ${slug}`);

      contentGenerated = true;
    } catch (error) {
      console.error('Error generating and saving content:', error);
      attempts++;
    }
  }

  if (!contentGenerated) {
    console.log(`Failed to generate unique content after ${maxAttempts} attempts.`);
  }
}

// Example usage
generateAndSaveContent();
