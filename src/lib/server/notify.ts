import { turso } from '../turso';
import type { ApologyPage } from '../apologyPages';

// Email the page owner when their recipient opens or answers the apology.
// Sends through Resend's REST API. A silent no-op until RESEND_API_KEY and
// EMAIL_FROM (an address on a domain verified in Resend) are configured.

const env = (key: string) => (import.meta.env[key] as string | undefined) || process.env[key];

async function ownerEmail(ownerId: string | null): Promise<string | null> {
  if (!ownerId || !turso) return null;
  const r = await turso.execute({ sql: 'SELECT email FROM user WHERE id = ? LIMIT 1', args: [ownerId] });
  return r.rows.length ? String(r.rows[0].email) : null;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type OwnerEvent = 'opened' | 'forgiven' | 'not_yet';

function compose(event: OwnerEvent, page: ApologyPage, url: string) {
  const who = page.recipientName?.trim() || 'Your recipient';
  const subject = {
    opened: `${who} opened your apology 💌`,
    forgiven: `${who} forgave you ❤️`,
    not_yet: `${who} read your apology`,
  }[event];
  const line = {
    opened: `${who} just opened “${page.title}”.`,
    forgiven: `${who} read “${page.title}” and answered: I forgive you.`,
    not_yet: `${who} read “${page.title}” and said they need a little more time. That's okay — give them space.`,
  }[event];
  const text = `${line}\n\nSee your page: ${url}\n\n— Apologify`;
  const html = `<div style="font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#1f2430;max-width:520px">
  <p>${escapeHtml(line)}</p>
  <p><a href="${url}" style="color:#b4232c">See your page →</a></p>
  <p style="color:#6b6f7a;font-size:14px">— Apologify</p></div>`;
  return { subject, text, html };
}

export async function notifyOwner(event: OwnerEvent, page: ApologyPage, origin: string): Promise<void> {
  const apiKey = env('RESEND_API_KEY');
  const from = env('EMAIL_FROM');
  if (!apiKey || !from) return;
  try {
    const to = await ownerEmail(page.ownerId);
    if (!to) return;
    const { subject, text, html } = compose(event, page, `${origin}/sorry/${page.slug}`);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text, html }),
    });
    if (!res.ok) console.error('notifyOwner: Resend responded', res.status, await res.text());
  } catch (e) {
    // Never let a notification failure break the recipient's tap.
    console.error('notifyOwner failed:', e);
  }
}
