import type { APIRoute } from 'astro';
import { EMAIL_RE, newsletterConfigured, sendConfirmation } from '../../../lib/server/newsletter';

export const prerender = false;

// Step 1 of the Apology News double opt-in: email a confirmation link.
// Accepts the form post (redirects) or fetch with Accept: application/json.
export const POST: APIRoute = async ({ request, url, redirect }) => {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const reply = (status: number, error?: string) =>
    wantsJson
      ? new Response(JSON.stringify(error ? { error } : { ok: true }), { status, headers: { 'Content-Type': 'application/json' } })
      : redirect(error ? `/news?subscribe=error` : `/news?subscribe=check`, 303);

  const form = await request.formData().catch(() => null);
  const email = String(form?.get('email') ?? '').trim().toLowerCase();
  if (String(form?.get('company') ?? '')) return reply(200); // honeypot: pretend it worked
  if (!EMAIL_RE.test(email) || email.length > 254) return reply(400, 'Please enter a valid email address.');
  if (!newsletterConfigured()) return reply(503, 'Subscriptions open soon. Follow us by RSS in the meantime.');

  const sent = await sendConfirmation(email, url.origin);
  return sent ? reply(200) : reply(502, 'We could not send the confirmation email. Please try again.');
};
