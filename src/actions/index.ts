import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { callOpenAIChatCompletion } from '../lib/server/openai';

const urlPattern = /https?:\/\/|www\.|\.com\b|\.net\b|\.org\b|\.io\b|\.co\b|\.me\b|\.info\b|\.xyz\b|\.dev\b|\.app\b/i;

/**
 * Normalize context text: strip HTML, special chars, collapse whitespace.
 * Keeps letters, numbers, basic punctuation, and accented characters.
 */
function normalizeContext(text: string): string {
  let result = text
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/&[a-z]+;/gi, ' ')        // strip HTML entities
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // strip emojis
    .replace(/[^\w\s.,!?;:'"()\-\u00C0-\u024F]/g, '') // keep letters, digits, basic punctuation, accented chars
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim();

  // Normalize ALL CAPS to sentence case
  const letters = result.replace(/[^a-zA-Z\u00C0-\u024F]/g, '');
  if (letters.length > 0 && letters === letters.toUpperCase()) {
    result = result.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00E0-\u024F])/g, (_, sep, ch) => sep + ch.toUpperCase());
  }

  return result;
}

export const server = { }

