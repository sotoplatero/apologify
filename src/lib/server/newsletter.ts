import { createHmac, timingSafeEqual } from 'node:crypto';

// Apology News signups, double opt-in: subscribe() emails a signed link and only
// confirm() adds the address to Resend (contact + newsletter segment), so the
// list never holds unconfirmed addresses. Needs RESEND_API_KEY, EMAIL_FROM,
// NEWS_SIGNING_SECRET and RESEND_SEGMENT_ID.

const env = (key: string) => (import.meta.env[key] as string | undefined) || process.env[key];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_TTL_MS = 3 * 24 * 3600 * 1000;

export function newsletterConfigured(): boolean {
  return Boolean(env('RESEND_API_KEY') && env('EMAIL_FROM') && env('NEWS_SIGNING_SECRET') && env('RESEND_SEGMENT_ID'));
}

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const sign = (payload: string) => createHmac('sha256', env('NEWS_SIGNING_SECRET')!).update(payload).digest('base64url');

export function makeToken(email: string): string {
  const payload = b64url(JSON.stringify({ e: email, t: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

/** The email in a valid, unexpired token; null otherwise. */
export function readToken(token: string): string | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { e, t } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof e !== 'string' || !EMAIL_RE.test(e) || Date.now() - t > TOKEN_TTL_MS) return null;
    return e;
  } catch {
    return null;
  }
}

async function resend(path: string, method: string, body?: unknown) {
  return fetch(`https://api.resend.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function sendConfirmation(email: string, origin: string): Promise<boolean> {
  const link = `${origin}/api/news/confirm?t=${encodeURIComponent(makeToken(email))}`;
  const html = `<div style="font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#241F1A;max-width:520px">
  <p style="font:600 12px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#C1272D">Apology News</p>
  <p>One click and you're in: every Tuesday, the week's public apologies, scored.</p>
  <p><a href="${link}" style="display:inline-block;background:#C1272D;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:600">Confirm my subscription</a></p>
  <p style="color:#6E655A;font-size:14px">If you didn't ask for this, ignore this email and nothing happens.</p></div>`;
  const res = await resend('/emails', 'POST', {
    from: env('EMAIL_FROM'),
    to: email,
    subject: 'Confirm your Apology News subscription',
    html,
    text: `Confirm your Apology News subscription: ${link}\n\nIf you didn't ask for this, ignore this email.`,
  });
  if (!res.ok) console.error('newsletter: confirmation email failed', res.status, await res.text());
  return res.ok;
}

/** Adds (or re-subscribes) a confirmed address to the newsletter segment. */
export async function addSubscriber(email: string): Promise<boolean> {
  const segment = env('RESEND_SEGMENT_ID')!;
  const created = await resend('/contacts', 'POST', { email, unsubscribed: false, segments: [{ id: segment }] });
  if (created.ok) return true;
  // Already a contact (e.g. resubscribing): flip them back on and make sure they're in the segment.
  const updated = await resend(`/contacts/${encodeURIComponent(email)}`, 'PATCH', { unsubscribed: false });
  const joined = await resend(`/contacts/${encodeURIComponent(email)}/segments/${segment}`, 'POST');
  if (!updated.ok) console.error('newsletter: add subscriber failed', created.status, await created.text());
  return updated.ok && (joined.ok || joined.status === 409);
}
