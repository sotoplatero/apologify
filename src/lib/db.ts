import { turso } from './turso';

export interface GeneratedLetter {
  id?: number;
  recipient: string;
  context: string;
  tone: string;
  letter: string;
  slug: string;
  created_at?: string;
}

/**
 * Check if Turso is configured
 */
function isTursoConfigured(): boolean {
  return turso !== null;
}

/**
 * Initialize the user_letters table
 */
export async function initDB() {
  if (!isTursoConfigured()) {
    throw new Error('Turso database is not configured. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.');
  }

  await turso!.execute(`
    CREATE TABLE IF NOT EXISTS user_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient TEXT NOT NULL,
      context TEXT NOT NULL,
      tone TEXT NOT NULL,
      letter TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_recipient ON user_letters(recipient)
  `);

  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_tone ON user_letters(tone)
  `);

  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_created_at ON user_letters(created_at)
  `);
}

/**
 * Save a generated letter to the database
 */
export async function saveGeneratedLetter(letter: GeneratedLetter): Promise<number> {
  if (!isTursoConfigured()) {
    console.warn('Turso not configured, letter not saved');
    return -1;
  }

  const result = await turso!.execute({
    sql: `
      INSERT INTO user_letters (recipient, context, tone, letter, slug)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [letter.recipient, letter.context, letter.tone, letter.letter, letter.slug]
  });

  return Number(result.lastInsertRowid);
}

/**
 * Get all generated letters
 */
export async function getAllGeneratedLetters(): Promise<GeneratedLetter[]> {
  if (!isTursoConfigured()) {
    return [];
  }

  const result = await turso!.execute('SELECT * FROM user_letters ORDER BY created_at DESC');
  return result.rows as unknown as GeneratedLetter[];
}

/**
 * Get generated letters by recipient
 */
export async function getGeneratedLettersByRecipient(recipient: string): Promise<GeneratedLetter[]> {
  if (!isTursoConfigured()) {
    return [];
  }

  const result = await turso!.execute({
    sql: 'SELECT * FROM user_letters WHERE recipient = ? ORDER BY created_at DESC',
    args: [recipient]
  });
  return result.rows as unknown as GeneratedLetter[];
}

/**
 * Get generated letters by tone
 */
export async function getGeneratedLettersByTone(tone: string): Promise<GeneratedLetter[]> {
  if (!isTursoConfigured()) {
    return [];
  }

  const result = await turso!.execute({
    sql: 'SELECT * FROM user_letters WHERE tone = ? ORDER BY created_at DESC',
    args: [tone]
  });
  return result.rows as unknown as GeneratedLetter[];
}

/**
 * Get a single generated letter by slug
 */
export async function getGeneratedLetterBySlug(slug: string): Promise<GeneratedLetter | null> {
  if (!isTursoConfigured()) {
    return null;
  }

  const result = await turso!.execute({
    sql: 'SELECT * FROM user_letters WHERE slug = ? LIMIT 1',
    args: [slug]
  });

  return result.rows.length > 0 ? (result.rows[0] as unknown as GeneratedLetter) : null;
}

/**
 * Search generated letters with filters
 */
export async function searchGeneratedLetters(filters: {
  recipient?: string;
  tone?: string;
  searchTerm?: string;
}): Promise<GeneratedLetter[]> {
  if (!isTursoConfigured()) {
    return [];
  }

  let sql = 'SELECT * FROM user_letters WHERE 1=1';
  const args: string[] = [];

  if (filters.recipient) {
    sql += ' AND recipient = ?';
    args.push(filters.recipient);
  }

  if (filters.tone) {
    sql += ' AND tone = ?';
    args.push(filters.tone);
  }

  if (filters.searchTerm) {
    sql += ' AND (context LIKE ? OR letter LIKE ?)';
    const searchPattern = `%${filters.searchTerm}%`;
    args.push(searchPattern, searchPattern);
  }

  sql += ' ORDER BY created_at DESC';

  const result = await turso!.execute({ sql, args });
  return result.rows as unknown as GeneratedLetter[];
}

/**
 * Delete a generated letter by ID
 */
export async function deleteGeneratedLetter(id: number): Promise<void> {
  if (!isTursoConfigured()) {
    throw new Error('Turso not configured');
  }

  await turso!.execute({
    sql: 'DELETE FROM user_letters WHERE id = ?',
    args: [id]
  });
}
