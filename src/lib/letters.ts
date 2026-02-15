import {
  getAllLettersFromDB,
  getLetterBySlug as getLetterBySlugFromDB,
  getLettersByRecipient as getLettersByRecipientFromDB,
  getRecipientCounts,
  getToneCounts,
  type Letter
} from './db';

export type UnifiedLetter = Letter;

/**
 * Get all letters with optional filters
 */
export async function getAllLetters(filters?: {
  recipient?: string;
  tone?: string;
  searchTerm?: string;
  source?: 'static' | 'generated' | 'all';
}): Promise<Letter[]> {
  return getAllLettersFromDB(filters);
}

/**
 * Get letters by recipient
 */
export async function getLettersByRecipient(recipient: string): Promise<Letter[]> {
  return getLettersByRecipientFromDB(recipient);
}

/**
 * Get letters by tone
 */
export async function getLettersByTone(tone: string): Promise<Letter[]> {
  return getAllLettersFromDB({ tone });
}

/**
 * Get letters by recipient AND tone
 */
export async function getLettersByRecipientAndTone(recipient: string, tone: string): Promise<Letter[]> {
  return getAllLettersFromDB({ recipient, tone });
}

/**
 * Get a single letter by slug
 */
export async function getLetterBySlug(recipient: string, slug: string): Promise<Letter | null> {
  return getLetterBySlugFromDB(recipient, slug);
}

/**
 * Get unique recipients with counts
 */
export async function getAllRecipients(): Promise<Array<{ value: string; count: number }>> {
  const counts = await getRecipientCounts();
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Get unique tones with counts
 */
export async function getAllTones(): Promise<Array<{ value: string; count: number }>> {
  const counts = await getToneCounts();
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}
