import { turso } from './turso';

export interface ApologyPage {
  id?: number; slug: string; recipient: string; recipientName: string | null; senderName: string | null;
  audience: 'person' | 'public'; visibility: 'private' | 'public'; ownerId: string | null;
  message: string; title: string; theme: string; tone: string; isPaid: boolean;
  acceptedAt: string | null; likes: number; createdAt?: string;
}

function rowToPage(row: any): ApologyPage {
  return {
    id: row.id, slug: row.slug, recipient: row.recipient,
    recipientName: row.recipient_name ?? null, senderName: row.sender_name ?? null,
    audience: row.audience === 'public' ? 'public' : 'person',
    visibility: row.visibility === 'public' ? 'public' : 'private',
    ownerId: row.owner_id ?? null,
    message: row.message, title: row.title, theme: row.theme, tone: row.tone,
    isPaid: Number(row.is_paid) === 1, acceptedAt: row.accepted_at ?? null,
    likes: Number(row.likes) || 0, createdAt: row.created_at,
  };
}

/** Increment a page's like counter and return the new total. */
export async function likeApology(slug: string): Promise<number> {
  if (!turso) throw new Error('Turso not configured');
  await turso.execute({ sql: 'UPDATE apology_pages SET likes = likes + 1 WHERE slug = ?', args: [slug] });
  const r = await turso.execute({ sql: 'SELECT likes FROM apology_pages WHERE slug = ? LIMIT 1', args: [slug] });
  return r.rows.length ? Number(r.rows[0].likes) || 0 : 0;
}

/** Current like count for a page. */
export async function getApologyLikes(slug: string): Promise<number> {
  if (!turso) return 0;
  const r = await turso.execute({ sql: 'SELECT likes FROM apology_pages WHERE slug = ? LIMIT 1', args: [slug] });
  return r.rows.length ? Number(r.rows[0].likes) || 0 : 0;
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

/**
 * A user's PUBLISHED pages, newest first — for the dashboard. Unpublished
 * drafts are just saved rows in the DB, not pages the user "has"; they only
 * become real (and appear here) once published.
 */
export async function getPublishedPagesByOwner(ownerId: string): Promise<ApologyPage[]> {
  if (!turso) return [];
  const r = await turso.execute({
    sql: "SELECT * FROM apology_pages WHERE owner_id = ? AND visibility = 'public' ORDER BY created_at DESC",
    args: [ownerId],
  });
  return r.rows.map(rowToPage);
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
export async function publishApologyPage(slug: string, userId: string, theme?: string): Promise<boolean> {
  if (!turso) throw new Error('Turso not configured');
  const sql = theme
    ? `UPDATE apology_pages SET visibility = 'public', owner_id = COALESCE(owner_id, ?), theme = ?
       WHERE slug = ? AND (owner_id IS NULL OR owner_id = ?)`
    : `UPDATE apology_pages SET visibility = 'public', owner_id = COALESCE(owner_id, ?)
       WHERE slug = ? AND (owner_id IS NULL OR owner_id = ?)`;
  const args = theme ? [userId, theme, slug, userId] : [userId, slug, userId];
  const r = await turso.execute({ sql, args });
  return r.rowsAffected > 0;
}

/** Change the design/template of an existing page. Owner-only. Returns true if updated. */
export async function updatePageTheme(slug: string, ownerId: string, theme: string): Promise<boolean> {
  if (!turso) throw new Error('Turso not configured');
  const r = await turso.execute({
    sql: 'UPDATE apology_pages SET theme = ? WHERE slug = ? AND owner_id = ?',
    args: [theme, slug, ownerId],
  });
  return r.rowsAffected > 0;
}

export async function markApologyPagePaid(slug: string): Promise<void> {
  if (!turso) throw new Error('Turso not configured');
  await turso.execute({ sql: 'UPDATE apology_pages SET is_paid = 1 WHERE slug = ?', args: [slug] });
}
