import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function init() {
  console.log('🚀 Creating apology_pages table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS apology_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      recipient TEXT NOT NULL,
      recipient_name TEXT DEFAULT NULL,
      sender_name TEXT DEFAULT NULL,
      audience TEXT NOT NULL DEFAULT 'person',
      visibility TEXT NOT NULL DEFAULT 'private',
      owner_id TEXT DEFAULT NULL,
      message TEXT NOT NULL,
      title TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT 'classic',
      tone TEXT NOT NULL DEFAULT 'heartfelt',
      is_paid INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_apology_pages_slug ON apology_pages(slug)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_apology_pages_visibility ON apology_pages(visibility, created_at)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_apology_pages_owner ON apology_pages(owner_id)`);
  console.log('✅ apology_pages ready');
}
init().catch((e) => { console.error('❌', e); process.exit(1); });
