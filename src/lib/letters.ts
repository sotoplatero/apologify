import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import {
  getAllGeneratedLetters,
  getGeneratedLettersByRecipient,
  getGeneratedLettersByTone,
  searchGeneratedLetters,
  type GeneratedLetter
} from './db';

/**
 * Unified letter interface that works for both static and generated letters
 */
export interface UnifiedLetter {
  id: string;
  slug: string;
  recipient: string;
  context: string;
  tone: string;
  letters: string[];
  source: 'static' | 'generated';
  created_at?: string;
}

/**
 * Convert static letter from content collection to unified format
 */
function convertStaticLetter(letter: CollectionEntry<'letters'>): UnifiedLetter {
  return {
    id: letter.id,
    slug: letter.id.split('/').pop()?.replace('.json', '') || letter.id,
    recipient: letter.data.recipient,
    context: letter.data.context,
    tone: letter.data.tone,
    letters: letter.data.letters,
    source: 'static'
  };
}

/**
 * Convert generated letter from DB to unified format
 */
function convertGeneratedLetter(letter: GeneratedLetter): UnifiedLetter {
  return {
    id: `generated-${letter.id}`,
    slug: letter.slug,
    recipient: letter.recipient,
    context: letter.context,
    tone: letter.tone,
    letters: [letter.letter], // Generated letters have single letter
    source: 'generated',
    created_at: letter.created_at
  };
}

/**
 * Get all letters (static + generated) with optional filters
 */
export async function getAllLetters(filters?: {
  recipient?: string;
  tone?: string;
  searchTerm?: string;
  source?: 'static' | 'generated' | 'all';
}): Promise<UnifiedLetter[]> {
  const allLetters: UnifiedLetter[] = [];

  // Get static letters if not filtered to generated only
  if (!filters?.source || filters.source === 'static' || filters.source === 'all') {
    try {
      const staticLetters = await getCollection('letters', (entry) => {
        let match = true;

        if (filters?.recipient) {
          match = match && entry.data.recipient === filters.recipient;
        }

        if (filters?.tone) {
          match = match && entry.data.tone === filters.tone;
        }

        if (filters?.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          match = match && (
            entry.data.context.toLowerCase().includes(searchLower) ||
            entry.data.letters.some(letter => letter.toLowerCase().includes(searchLower))
          );
        }

        return match;
      });

      allLetters.push(...staticLetters.map(convertStaticLetter));
    } catch (error) {
      console.error('Error fetching static letters:', error);
    }
  }

  // Get generated letters if not filtered to static only
  if (!filters?.source || filters.source === 'generated' || filters.source === 'all') {
    try {
      const generatedLetters = await searchGeneratedLetters({
        recipient: filters?.recipient,
        tone: filters?.tone,
        searchTerm: filters?.searchTerm
      });

      allLetters.push(...generatedLetters.map(convertGeneratedLetter));
    } catch (error) {
      console.error('Error fetching generated letters:', error);
      // If DB not initialized, just continue with static letters
    }
  }

  return allLetters;
}

/**
 * Get letters by recipient (static + generated)
 */
export async function getLettersByRecipient(recipient: string): Promise<UnifiedLetter[]> {
  return getAllLetters({ recipient });
}

/**
 * Get letters by tone (static + generated)
 */
export async function getLettersByTone(tone: string): Promise<UnifiedLetter[]> {
  return getAllLetters({ tone });
}

/**
 * Get letters by recipient AND tone
 */
export async function getLettersByRecipientAndTone(recipient: string, tone: string): Promise<UnifiedLetter[]> {
  return getAllLetters({ recipient, tone });
}

/**
 * Get a single letter by slug (checks both static and generated)
 */
export async function getLetterBySlug(recipient: string, slug: string): Promise<UnifiedLetter | null> {
  // Try static first
  try {
    const staticLetters = await getCollection('letters');
    const staticLetter = staticLetters.find(letter => {
      const letterSlug = letter.id.split('/').pop()?.replace('.json', '');
      return letter.data.recipient === recipient && letterSlug === slug;
    });

    if (staticLetter) {
      return convertStaticLetter(staticLetter);
    }
  } catch (error) {
    console.error('Error fetching static letter:', error);
  }

  // Try generated
  try {
    const { getGeneratedLetterBySlug } = await import('./db');
    const generatedLetter = await getGeneratedLetterBySlug(slug);
    if (generatedLetter && generatedLetter.recipient === recipient) {
      return convertGeneratedLetter(generatedLetter);
    }
  } catch (error) {
    console.error('Error fetching generated letter:', error);
  }

  return null;
}

/**
 * Get unique recipients from all letters
 */
export async function getAllRecipients(): Promise<Array<{ value: string; count: number }>> {
  const allLetters = await getAllLetters();
  const recipientCounts = allLetters.reduce((acc, letter) => {
    acc[letter.recipient] = (acc[letter.recipient] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(recipientCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Get unique tones from all letters
 */
export async function getAllTones(): Promise<Array<{ value: string; count: number }>> {
  const allLetters = await getAllLetters();
  const toneCounts = allLetters.reduce((acc, letter) => {
    acc[letter.tone] = (acc[letter.tone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(toneCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}
