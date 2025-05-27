import type { APIRoute } from 'astro';
import { getAllApologyLetters, getApologyLettersByRecipient, searchLettersWithFilters } from '../../lib/database';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const recipient = searchParams.get('recipient');
    const tone = searchParams.get('tone');
    const situation = searchParams.get('situation');
    const search = searchParams.get('search');

    let letters;

    // If any filters are provided, use the advanced search
    if (recipient || tone || situation || search) {
      letters = await searchLettersWithFilters({
        recipient: recipient || undefined,
        tone: tone || undefined,
        situation: situation || undefined,
        searchTerm: search || undefined,
      });
    } else {
      // Otherwise, get all letters
      letters = await getAllApologyLetters();
    }

    return new Response(JSON.stringify({
      success: true,
      data: letters,
      count: letters.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching letters:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch letters'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 