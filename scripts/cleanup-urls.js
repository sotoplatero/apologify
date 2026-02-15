import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function cleanupUrls() {
  console.log('Searching for letters containing URLs...\n');

  try {
    // Find letters with URLs in context or letter content
    const result = await turso.execute(`
      SELECT id, recipient, slug, context, letters
      FROM letters
      WHERE context LIKE '%http://%'
         OR context LIKE '%https://%'
         OR context LIKE '%www.%'
         OR letters LIKE '%http://%'
         OR letters LIKE '%https://%'
         OR letters LIKE '%www.%'
         OR context LIKE '%.com/%'
         OR letters LIKE '%.com/%'
    `);

    if (result.rows.length === 0) {
      console.log('No letters with URLs found.');
      return;
    }

    console.log(`Found ${result.rows.length} letters with URLs:\n`);

    for (const row of result.rows) {
      console.log(`  ID: ${row.id} | Recipient: ${row.recipient} | Slug: ${row.slug}`);

      // Show URL matches in context
      const context = String(row.context);
      const urlMatches = context.match(/https?:\/\/[^\s"']+|www\.[^\s"']+/gi);
      if (urlMatches) {
        console.log(`    Context URLs: ${urlMatches.join(', ')}`);
      }

      // Show URL matches in letter content
      const letters = String(row.letters);
      const letterUrlMatches = letters.match(/https?:\/\/[^\s"']+|www\.[^\s"']+/gi);
      if (letterUrlMatches) {
        console.log(`    Letter URLs: ${letterUrlMatches.join(', ')}`);
      }
    }

    // Delete them
    const ids = result.rows.map(r => r.id);
    console.log(`\nDeleting ${ids.length} letters...`);

    await turso.execute({
      sql: `DELETE FROM letters WHERE id IN (${ids.map(() => '?').join(',')})`,
      args: ids
    });

    console.log(`Deleted ${ids.length} letters with URLs.`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupUrls();
