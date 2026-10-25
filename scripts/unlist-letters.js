// Unlist example letters that add no value: pages Google crawled but chose not
// to index, and descriptions the apology study classified as not genuine
// (jokes, spam, gibberish) — except any page that earned a search click.
// Unlisted letters answer 410 Gone and drop out of listings and sitemaps; the
// rows stay in the DB, so this is reversible:
//   node scripts/unlist-letters.js <ids.json>          # mark unlisted
//   node scripts/unlist-letters.js --restore <ids.json> # undo
import { createClient } from '@libsql/client';
import 'dotenv/config';
import fs from 'node:fs';

const restore = process.argv.includes('--restore');
const file = process.argv.filter((a) => !a.startsWith('--')).at(-1);
const ids = JSON.parse(fs.readFileSync(file, 'utf8')).map((x) => (typeof x === 'object' ? x.id : x));

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
try { await db.execute('ALTER TABLE letters ADD COLUMN unlisted INTEGER NOT NULL DEFAULT 0'); }
catch (_) { /* column already exists */ }

const value = restore ? 0 : 1;
await db.batch(ids.map((id) => ({ sql: 'UPDATE letters SET unlisted = ? WHERE id = ?', args: [value, id] })), 'write');
const { rows } = await db.execute('SELECT SUM(unlisted) AS unlisted, COUNT(*) AS total FROM letters');
console.log(`${restore ? 'restored' : 'unlisted'} ${ids.length} letters → now ${rows[0].unlisted} unlisted of ${rows[0].total}`);
