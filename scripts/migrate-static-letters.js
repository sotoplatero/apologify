import { createClient } from "@libsql/client/web";
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const LETTERS_DIR = path.resolve('src/content/letters');

async function migrateStaticLetters() {
  console.log('🚀 Migrating static letters to Turso DB...\n');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  const recipientDirs = fs.readdirSync(LETTERS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`📂 Found ${recipientDirs.length} recipient directories: ${recipientDirs.join(', ')}\n`);

  for (const recipient of recipientDirs) {
    const recipientPath = path.join(LETTERS_DIR, recipient);
    const files = fs.readdirSync(recipientPath).filter(f => f.endsWith('.json'));

    console.log(`📁 ${recipient}: ${files.length} files`);

    for (const file of files) {
      const filePath = path.join(recipientPath, file);
      const slug = file.replace('.json', '');

      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        await turso.execute({
          sql: `INSERT OR IGNORE INTO letters (recipient, context, tone, letters, slug, source, created_at)
                VALUES (?, ?, ?, ?, ?, 'static', '2024-01-01T00:00:00Z')`,
          args: [
            data.recipient,
            data.context,
            data.tone,
            JSON.stringify(data.letters),
            slug
          ]
        });

        inserted++;
        console.log(`  ✅ ${slug}`);
      } catch (err) {
        if (err.message?.includes('UNIQUE constraint')) {
          skipped++;
          console.log(`  ⏭️  ${slug} (already exists)`);
        } else {
          errors++;
          console.error(`  ❌ ${slug}: ${err.message}`);
        }
      }
    }
  }

  console.log('\n✨ Migration complete!');
  console.log(`📋 Summary:`);
  console.log(`   - Inserted: ${inserted}`);
  console.log(`   - Skipped (duplicates): ${skipped}`);
  console.log(`   - Errors: ${errors}`);

  // Verify count
  const result = await turso.execute("SELECT COUNT(*) as count FROM letters WHERE source = 'static'");
  console.log(`   - Total static letters in DB: ${result.rows[0].count}\n`);
}

migrateStaticLetters().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
