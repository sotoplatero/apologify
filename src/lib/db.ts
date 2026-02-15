import { turso } from './turso';

export interface Letter {
  id?: number;
  recipient: string;
  context: string;
  tone: string;
  letters: string[];
  slug: string;
  source: 'static' | 'generated';
  title?: string;
  created_at?: string;
}

// Keep for backwards compatibility with actions
export interface GeneratedLetter {
  id?: number;
  recipient: string;
  context: string;
  tone: string;
  letter: string;
  slug: string;
  title?: string;
  created_at?: string;
}

function isTursoConfigured(): boolean {
  return turso !== null;
}

function rowToLetter(row: any): Letter {
  return {
    id: row.id,
    recipient: row.recipient,
    context: row.context,
    tone: row.tone,
    letters: JSON.parse(row.letters),
    slug: row.slug,
    source: row.source,
    title: row.title || undefined,
    created_at: row.created_at
  };
}

/**
 * Save a generated letter to the database
 */
export async function saveGeneratedLetter(data: {
  recipient: string;
  context: string;
  tone: string;
  letter: string;
  slug: string;
  title?: string;
}): Promise<number> {
  if (!isTursoConfigured()) {
    console.warn('Turso not configured, letter not saved');
    return -1;
  }

  const result = await turso!.execute({
    sql: `INSERT INTO letters (recipient, context, tone, letters, slug, source, title)
          VALUES (?, ?, ?, ?, ?, 'generated', ?)`,
    args: [data.recipient, data.context, data.tone, JSON.stringify([data.letter]), data.slug, data.title || null]
  });

  return Number(result.lastInsertRowid);
}

/**
 * Get all letters with optional filters
 */
export async function getAllLettersFromDB(filters?: {
  recipient?: string;
  tone?: string;
  searchTerm?: string;
  source?: 'static' | 'generated' | 'all';
}): Promise<Letter[]> {
  if (!isTursoConfigured()) return [];

  let sql = 'SELECT * FROM letters WHERE 1=1';
  const args: any[] = [];

  if (filters?.recipient) {
    sql += ' AND recipient = ?';
    args.push(filters.recipient);
  }
  if (filters?.tone) {
    sql += ' AND tone = ?';
    args.push(filters.tone);
  }
  if (filters?.source && filters.source !== 'all') {
    sql += ' AND source = ?';
    args.push(filters.source);
  }
  if (filters?.searchTerm) {
    sql += ' AND (context LIKE ? OR letters LIKE ? OR title LIKE ?)';
    const pattern = `%${filters.searchTerm}%`;
    args.push(pattern, pattern, pattern);
  }

  sql += ' ORDER BY created_at DESC';

  const result = await turso!.execute({ sql, args });
  return result.rows.map(rowToLetter);
}

/**
 * Get a single letter by recipient and slug
 */
export async function getLetterBySlug(recipient: string, slug: string): Promise<Letter | null> {
  if (!isTursoConfigured()) return null;

  const result = await turso!.execute({
    sql: 'SELECT * FROM letters WHERE recipient = ? AND slug = ? LIMIT 1',
    args: [recipient, slug]
  });

  return result.rows.length > 0 ? rowToLetter(result.rows[0]) : null;
}

/**
 * Get letters by recipient
 */
export async function getLettersByRecipient(recipient: string): Promise<Letter[]> {
  if (!isTursoConfigured()) return [];

  const result = await turso!.execute({
    sql: 'SELECT * FROM letters WHERE recipient = ? ORDER BY created_at DESC',
    args: [recipient]
  });

  return result.rows.map(rowToLetter);
}

/**
 * Get total letter count
 */
export async function getLetterCount(): Promise<number> {
  if (!isTursoConfigured()) return 0;

  const result = await turso!.execute('SELECT COUNT(*) as count FROM letters');
  return Number(result.rows[0].count);
}

/**
 * Get letter counts grouped by recipient
 */
export async function getRecipientCounts(): Promise<Record<string, number>> {
  if (!isTursoConfigured()) return {};

  const result = await turso!.execute('SELECT recipient, COUNT(*) as count FROM letters GROUP BY recipient');
  const counts: Record<string, number> = {};
  for (const row of result.rows) {
    counts[row.recipient as string] = Number(row.count);
  }
  return counts;
}

/**
 * Get letter counts grouped by tone
 */
export async function getToneCounts(): Promise<Record<string, number>> {
  if (!isTursoConfigured()) return {};

  const result = await turso!.execute('SELECT tone, COUNT(*) as count FROM letters GROUP BY tone');
  const counts: Record<string, number> = {};
  for (const row of result.rows) {
    counts[row.tone as string] = Number(row.count);
  }
  return counts;
}

/**
 * Get paginated letters with optional filters
 */
export async function getLettersPaginated(page: number, pageSize: number, filters?: {
  recipient?: string;
  tone?: string;
  searchTerm?: string;
}): Promise<{
  letters: Letter[];
  total: number;
  lastPage: number;
}> {
  if (!isTursoConfigured()) return { letters: [], total: 0, lastPage: 1 };

  const offset = (page - 1) * pageSize;

  let whereClauses = '1=1';
  const args: any[] = [];

  if (filters?.recipient) {
    whereClauses += ' AND recipient = ?';
    args.push(filters.recipient);
  }
  if (filters?.tone) {
    whereClauses += ' AND tone = ?';
    args.push(filters.tone);
  }
  if (filters?.searchTerm) {
    whereClauses += ' AND (context LIKE ? OR letters LIKE ? OR title LIKE ?)';
    const pattern = `%${filters.searchTerm}%`;
    args.push(pattern, pattern, pattern);
  }

  const [dataResult, countResult] = await Promise.all([
    turso!.execute({
      sql: `SELECT * FROM letters WHERE ${whereClauses} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, pageSize, offset]
    }),
    turso!.execute({
      sql: `SELECT COUNT(*) as count FROM letters WHERE ${whereClauses}`,
      args: [...args]
    })
  ]);

  const total = Number(countResult.rows[0].count);
  return {
    letters: dataResult.rows.map(rowToLetter),
    total,
    lastPage: Math.ceil(total / pageSize)
  };
}

/**
 * Get related letters (same recipient, excluding current)
 */
export async function getRelatedLetters(recipient: string, excludeSlug: string, limit: number = 4): Promise<Letter[]> {
  if (!isTursoConfigured()) return [];

  const result = await turso!.execute({
    sql: 'SELECT * FROM letters WHERE recipient = ? AND slug != ? ORDER BY RANDOM() LIMIT ?',
    args: [recipient, excludeSlug, limit]
  });

  return result.rows.map(rowToLetter);
}

/**
 * Get random sample letters
 */
export async function getSampleLetters(count: number): Promise<Letter[]> {
  if (!isTursoConfigured()) return [];

  const result = await turso!.execute({
    sql: 'SELECT * FROM letters ORDER BY RANDOM() LIMIT ?',
    args: [count]
  });

  return result.rows.map(rowToLetter);
}

/**
 * Delete a letter by ID
 */
export async function deleteGeneratedLetter(id: number): Promise<void> {
  if (!isTursoConfigured()) {
    throw new Error('Turso not configured');
  }

  await turso!.execute({
    sql: 'DELETE FROM letters WHERE id = ?',
    args: [id]
  });
}
