import { createClient } from "@libsql/client/web";
import 'dotenv/config';

// Readers' scores for the apologies in Apology News: one 0–5 vote per signed-in
// user per case, which they can change. Idempotent; run before deploying the
// code that reads it (pnpm db:init-news).
const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function init() {
  console.log('🚀 Creating news_votes table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS news_votes (
      issue_slug TEXT NOT NULL,
      item_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (issue_slug, item_id, user_id)
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_news_votes_issue ON news_votes(issue_slug, item_id)`);
  console.log('✅ news_votes ready');
}
init().catch((e) => { console.error('❌', e); process.exit(1); });
