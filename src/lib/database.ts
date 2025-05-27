import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export interface ApologyLetter {
  slug: string;
  tone: string;
  recipient: string;
  context: string;
  letters: string[];
}

export interface SearchFilters {
  recipient?: string;
  tone?: string;
  situation?: string;
  searchTerm?: string;
}

export async function getAllApologyLetters(): Promise<ApologyLetter[]> {
  try {
    const letters = await getCollection('letters');
    return letters.map(letter => ({
      slug: letter.id,
      tone: letter.data.tone,
      recipient: letter.data.recipient,
      context: letter.data.context,
      letters: letter.data.letters
    }));
  } catch (error) {
    console.error('Error fetching all apology letters:', error);
    return [];
  }
}

export async function getApologyLettersByRecipient(recipient: string): Promise<ApologyLetter[]> {
  try {
    const letters = await getCollection('letters');
    return letters
      .filter(letter => letter.data.recipient === recipient)
      .map(letter => ({
        slug: letter.id,
        tone: letter.data.tone,
        recipient: letter.data.recipient,
        context: letter.data.context,
        letters: letter.data.letters
      }));
  } catch (error) {
    console.error(`Error fetching letters for recipient ${recipient}:`, error);
    return [];
  }
}

export async function searchLettersWithFilters(filters: SearchFilters): Promise<ApologyLetter[]> {
  try {
    const letters = await getCollection('letters');
    
    return letters
      .filter(letter => {
        // Filter by recipient
        if (filters.recipient && letter.data.recipient !== filters.recipient) {
          return false;
        }
        
        // Filter by tone
        if (filters.tone && letter.data.tone !== filters.tone) {
          return false;
        }
        
        // Filter by situation (search in context)
        if (filters.situation && !letter.data.context.toLowerCase().includes(filters.situation.toLowerCase())) {
          return false;
        }
        
        // Filter by search term (search in context and letters content)
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          const contextMatch = letter.data.context.toLowerCase().includes(searchTerm);
          const lettersMatch = letter.data.letters.some(letterText => 
            letterText.toLowerCase().includes(searchTerm)
          );
          
          if (!contextMatch && !lettersMatch) {
            return false;
          }
        }
        
        return true;
      })
      .map(letter => ({
        slug: letter.id,
        tone: letter.data.tone,
        recipient: letter.data.recipient,
        context: letter.data.context,
        letters: letter.data.letters
      }));
  } catch (error) {
    console.error('Error searching letters with filters:', error);
    return [];
  }
} 