import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrateExistingRows() {
  console.log('🚀 Migrating user_letters rows to letters table...\n');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  const result = await turso.execute('SELECT * FROM user_letters');
  console.log(`📊 Found ${result.rows.length} rows in user_letters\n`);

  for (const row of result.rows) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO letters (recipient, context, tone, letters, slug, source, created_at)
              VALUES (?, ?, ?, ?, ?, 'generated', ?)`,
        args: [
          row.recipient,
          row.context,
          row.tone,
          JSON.stringify([row.letter]),
          row.slug,
          row.created_at
        ]
      });

      inserted++;
      console.log(`  ✅ ${row.slug}`);
    } catch (err) {
      if (err.message?.includes('UNIQUE constraint')) {
        skipped++;
        console.log(`  ⏭️  ${row.slug} (already exists)`);
      } else {
        errors++;
        console.error(`  ❌ ${row.slug}: ${err.message}`);
      }
    }
  }

  console.log('\n✨ Migration complete!');
  console.log(`📋 Summary:`);
  console.log(`   - Inserted: ${inserted}`);
  console.log(`   - Skipped (duplicates): ${skipped}`);
  console.log(`   - Errors: ${errors}`);

  // Verify counts
  const total = await turso.execute("SELECT COUNT(*) as count FROM letters");
  const generated = await turso.execute("SELECT COUNT(*) as count FROM letters WHERE source = 'generated'");
  const staticCount = await turso.execute("SELECT COUNT(*) as count FROM letters WHERE source = 'static'");
  console.log(`   - Total letters in DB: ${total.rows[0].count}`);
  console.log(`   - Static: ${staticCount.rows[0].count}`);
  console.log(`   - Generated: ${generated.rows[0].count}\n`);
}

migrateExistingRows().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
