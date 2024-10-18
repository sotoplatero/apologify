import fs from 'fs/promises';
import path from 'path';
import { callOpenAIChatCompletion } from './src/lib/openai.js';
import { prompts } from './src/lib/prompts.js';
import { patterns } from './src/lib/patterns.js';
import { removeStopwords } from 'stopword';
import fetch from 'node-fetch';

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

async function selectAvailableVariables(pattern, variableNames, availableVariables, existingSlugs) {
  const selectedVariables = {};
  for (const varName of variableNames) {
    if (availableVariables[varName] && availableVariables[varName].length > 0) {
      selectedVariables[varName] = selectRandomElement(availableVariables[varName]);
    } else {
      console.log(`No available values for variable: ${varName}`);
      return null;
    }
  }
  
  const title = createTitle(pattern, selectedVariables);
  const slug = createSlug(title);
  
  if (existingSlugs.has(slug)) {
    console.log(`Slug already exists: ${slug}`);
    return null;
  }
  
  return selectedVariables;
}

function createTitle(pattern, variables) {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => {
    if (variables[key] === undefined) {
      console.error(`Undefined variable: ${key}`);
      return '{' + key + '}';
    }
    return variables[key];
  });
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
  const dir = path.join(process.cwd(), 'src', 'content', 'articles', slug);
  try {
    await fs.access(path.join(dir, 'index.md'));
    return true;
  } catch {
    return false;
  }
}

async function getUnsplashImage(query) {
  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Unsplash API response:', JSON.stringify(data, null, 2));
    
    if (!data.user || !data.user.name) {
      console.warn('Photographer name not found in Unsplash response');
    }
    
    return {
      url: data.urls.regular,
      photographer: data.user?.name || 'Unknown photographer',
      photographerUrl: data.user?.links?.html || 'https://unsplash.com'
    };
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return {
      url: 'https://via.placeholder.com/1200x800.png?text=Image+Not+Available',
      photographer: 'Unknown photographer',
      photographerUrl: 'https://unsplash.com'
    };
  }
}

async function saveContent(content, title) {
  const slug = createSlug(title);
  const dir = path.join(process.cwd(), 'src', 'content', 'articles', slug);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, 'index.md');

  // Obtener una imagen de Unsplash
  const imageData = await getUnsplashImage(title);
  console.log('Image data:', imageData);

  // Extraer el frontmatter y el contenido
  const [, frontmatter, bodyContent] = content.match(/---([\s\S]*?)---([\s\S]*)/);

  // Agregar la propiedad image y la información del fotógrafo al frontmatter
  const updatedFrontmatter = `---
${frontmatter.trim()}
image: "${imageData.url}"
photographer: "${imageData.photographer}"
photographerUrl: "${imageData.photographerUrl}"
---`;

  // Reconstruir el contenido con el frontmatter actualizado
  const updatedContent = `${updatedFrontmatter}

${bodyContent.trim()}`;

  await fs.writeFile(filePath, updatedContent, 'utf-8');
  return { filePath, slug };
}

async function getExistingSlugs() {
  const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');
  const slugs = new Set();
  try {
    const entries = await fs.readdir(articlesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        slugs.add(entry.name);
      }
    }
  } catch (error) {
    console.error('Error reading articles directory:', error);
  }
  return slugs;
}

async function generateAndSaveContent() {
  const existingSlugs = await getExistingSlugs();
  let contentGenerated = false;
  let attempts = 0;
  const maxAttempts = patterns.patterns.length * 10;

  while (!contentGenerated && attempts < maxAttempts) {
    try {
      const selectedPattern = selectRandomElement(patterns.patterns);
      const variableNames = extractVariables(selectedPattern);
      const selectedVariables = await selectAvailableVariables(selectedPattern, variableNames, patterns.variables, existingSlugs);

      if (!selectedVariables) {
        console.log(`No available combination found for pattern: "${selectedPattern}". Trying another pattern...`);
        attempts++;
        continue;
      }

      const title = createTitle(selectedPattern, selectedVariables);
      const slug = createSlug(title);

      if (existingSlugs.has(slug)) {
        console.log(`Content for "${title}" already exists. Trying another combination...`);
        attempts++;
        continue;
      }

      const content = await generateContent({pattern: selectedPattern, title: title });
      if (!content) {
        console.log(`Failed to generate content for "${title}". Trying another combination...`);
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
