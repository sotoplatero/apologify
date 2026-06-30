import { turso } from './turso';

export interface ApologyPage {
  id?: number; slug: string; recipient: string; recipientName: string | null; senderName: string | null;
  audience: 'person' | 'public'; visibility: 'private' | 'public'; ownerId: string | null;
  message: string; title: string; theme: string; tone: string; isPaid: boolean; createdAt?: string;
}

function rowToPage(row: any): ApologyPage {
  return {
    id: row.id, slug: row.slug, recipient: row.recipient,
    recipientName: row.recipient_name ?? null, senderName: row.sender_name ?? null,
    audience: row.audience === 'public' ? 'public' : 'person',
    visibility: row.visibility === 'public' ? 'public' : 'private',
    ownerId: row.owner_id ?? null,
    message: row.message, title: row.title, theme: row.theme, tone: row.tone,
    isPaid: Number(row.is_paid) === 1, createdAt: row.created_at,
  };
}

export async function saveApologyPage(data: {
  slug: string; recipient: string; recipientName?: string | null; senderName?: string | null;
  audience: 'person' | 'public'; visibility: 'private' | 'public'; ownerId?: string | null;
  message: string; title: string; theme: string; tone: string;
}): Promise<number> {
  if (!turso) { console.warn('Turso not configured, page not saved'); return -1; }
  const result = await turso.execute({
    sql: `INSERT INTO apology_pages (slug, recipient, recipient_name, sender_name, audience, visibility, owner_id, message, title, theme, tone, is_paid)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    args: [data.slug, data.recipient, data.recipientName ?? null, data.senderName ?? null,
           data.audience, data.visibility, data.ownerId ?? null, data.message, data.title, data.theme, data.tone],
  });
  return Number(result.lastInsertRowid);
}

export async function getApologyPageBySlug(slug: string): Promise<ApologyPage | null> {
  if (!turso) return null;
  const r = await turso.execute({ sql: 'SELECT * FROM apology_pages WHERE slug = ? LIMIT 1', args: [slug] });
  return r.rows.length ? rowToPage(r.rows[0]) : null;
}

export async function getRecentPublicPages(limit: number): Promise<ApologyPage[]> {
  if (!turso) return [];
  const r = await turso.execute({ sql: "SELECT * FROM apology_pages WHERE visibility = 'public' ORDER BY created_at DESC LIMIT ?", args: [limit] });
  return r.rows.map(rowToPage);
}

export async function getAllPublicSlugs(): Promise<{ slug: string; createdAt?: string }[]> {
  if (!turso) return [];
  const r = await turso.execute("SELECT slug, created_at FROM apology_pages WHERE visibility = 'public' ORDER BY created_at DESC");
  return r.rows.map((row: any) => ({ slug: row.slug, createdAt: row.created_at }));
}

/**
 * Publish a draft page: make it public + claim ownership. Only the existing
 * owner or an unowned (anonymous-draft) page can be published. Returns true if
 * a row was published.
 */
export async function publishApologyPage(slug: string, userId: string): Promise<boolean> {
  if (!turso) throw new Error('Turso not configured');
  const r = await turso.execute({
    sql: `UPDATE apology_pages SET visibility = 'public', owner_id = COALESCE(owner_id, ?)
          WHERE slug = ? AND (owner_id IS NULL OR owner_id = ?)`,
    args: [userId, slug, userId],
  });
  return r.rowsAffected > 0;
}

export async function markApologyPagePaid(slug: string): Promise<void> {
  if (!turso) throw new Error('Turso not configured');
  await turso.execute({ sql: 'UPDATE apology_pages SET is_paid = 1 WHERE slug = ?', args: [slug] });
}
