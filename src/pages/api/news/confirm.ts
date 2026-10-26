import type { APIRoute } from 'astro';
import { addSubscriber, newsletterConfigured, readToken } from '../../../lib/server/newsletter';

export const prerender = false;

// Step 2 of the Apology News double opt-in: the link in the confirmation email.
export const GET: APIRoute = async ({ url, redirect }) => {
  if (!newsletterConfigured()) return redirect('/news', 303);
  const email = readToken(url.searchParams.get('t') || '');
  if (!email) return new Response('This confirmation link is invalid or has expired. Please subscribe again at /news.', { status: 400 });
  const ok = await addSubscriber(email);
  return ok ? redirect('/news?subscribed=1', 303) : new Response('Something went wrong. Please try again later.', { status: 502 });
};
