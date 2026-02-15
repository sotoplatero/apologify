import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const MIN_CONTEXT_LENGTH = 20;

/**
 * Normalize context the same way the server action does.
 */
function normalizeContext(text) {
  let result = text
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^\w\s.,!?;:'"()\-\u00C0-\u024F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const letters = result.replace(/[^a-zA-Z\u00C0-\u024F]/g, '');
  if (letters.length > 0 && letters === letters.toUpperCase()) {
    result = result.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00E0-\u024F])/g, (_, sep, ch) => sep + ch.toUpperCase());
  }

  return result;
}

async function cleanupEmptyContext() {
  console.log(`Searching for letters with context shorter than ${MIN_CONTEXT_LENGTH} chars after normalization...\n`);

  try {
    const result = await turso.execute('SELECT id, recipient, slug, context FROM letters');

    const toDelete = [];

    for (const row of result.rows) {
      const raw = String(row.context || '');
      const normalized = normalizeContext(raw);

      if (normalized.length < MIN_CONTEXT_LENGTH) {
        toDelete.push(row);
        console.log(`  ID: ${row.id} | Recipient: ${row.recipient} | Slug: ${row.slug}`);
        console.log(`    Raw context: "${raw}"`);
        console.log(`    Normalized (${normalized.length} chars): "${normalized}"\n`);
      }
    }

    if (toDelete.length === 0) {
      console.log('No letters with empty/short context found.');
      return;
    }

    console.log(`Found ${toDelete.length} letters to delete.`);

    const ids = toDelete.map(r => r.id);
    await turso.execute({
      sql: `DELETE FROM letters WHERE id IN (${ids.map(() => '?').join(',')})`,
      args: ids,
    });

    console.log(`Deleted ${ids.length} letters.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupEmptyContext();
