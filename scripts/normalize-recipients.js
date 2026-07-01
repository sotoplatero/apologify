import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Canonical recipients defined in the system (src/lib/apologyData.js ALL_RECIPIENTS).
const CANONICAL = new Set([
  'mother','father','son','daughter','wife','husband','friend','romantic','girlfriend','boyfriend',
  'sibling','grandmother','grandfather','ex','neighbor','boss','manager','supervisor','colleague',
  'client','teacher','partner','hr','vendor','investor','employee','professor','classmate','mentor','public',
]);

// Exact-match shortcuts (checked before substring rules) for short/ambiguous tokens.
const EXACT = {
  bf: 'boyfriend', gf: 'girlfriend', ex: 'ex', bff: 'friend',
  mom: 'mother', mum: 'mother', dad: 'father', sis: 'sibling', bro: 'sibling',
};

// Ordered keyword rules: first matching substring wins. Specific before general.
const RULES = [
  [['girlfriend','girl friend','girl-friend','novia','jevita','enamorada','pacar'], 'girlfriend'],
  [['boyfriend','boyfreind','boy friend','novio'], 'boyfriend'],
  [['grandmother','grandma','granny','grandmom','abuela','nana','granddaughter'], 'grandmother'],
  [['grandfather','grandpa','grandad','abuelo','grandson'], 'grandfather'],
  [['stepmom','mother','mommy',' mom','^mom','mum','mama','mamá','madre','mam'], 'mother'],
  [['father','daddy',' dad','^dad','papa','papá','padre'], 'father'],
  [['daughter'], 'daughter'],
  [['son in law',' son','^son'], 'son'],
  [['sister','brother','sibling','bro ','behen','bhai'], 'sibling'],
  [['wife','esposa'], 'wife'],
  [['husband','esposo','hubby'], 'husband'],
  [['situationship','situation ship','crush','romantic'], 'romantic'],
  [['business partner'], 'partner'],
  [['bestie','best friend','bestfriend','bestt frien','bestfrnd','bff','buddy','bespren','female friend','female bff','bestfrienddd','bff','amig','saheli','friend'], 'friend'],
  [['boss','jefe'], 'boss'],
  [['supervisor'], 'supervisor'],
  [['manager'], 'manager'],
  [['coworker','co-worker','co worker','colleague','colega','compañero'], 'colleague'],
  [['classmate'], 'classmate'],
  [['professor'], 'professor'],
  [['mentor'], 'mentor'],
  [['teacher','techer','band teacher','coach','tutor','maestr','profesor'], 'teacher'],
  [['client','customer','cliente'], 'client'],
  [['vendor'], 'vendor'],
  [['investor'], 'investor'],
  [['employee'], 'employee'],
  [['neighbor','neighbour','landlord','tenant'], 'neighbor'],
  [['public','community','fans','followers','audience','discord','group chat','groupchat','instagram','subscrib','mods','facebook','server','the city','people on','online friends'], 'public'],
];

function normalize(raw) {
  if (raw == null) return 'friend';
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
  if (CANONICAL.has(s)) return s;            // already canonical (after trim/case)
  if (EXACT[s]) return EXACT[s];             // short/ambiguous exact tokens
  for (const [keys, target] of RULES) {
    for (const k of keys) {
      if (k.startsWith('^')) { if (s.startsWith(k.slice(1))) return target; }
      else if (s.includes(k)) return target;
    }
  }
  return 'friend'; // generic fallback so the content stays usable in the directory
}

const APPLY = process.argv.includes('--apply');

async function run() {
  for (const tbl of ['letters', 'apology_pages']) {
    const r = await turso.execute(`SELECT id, recipient FROM ${tbl}`);
    const changes = [];
    const dist = {};
    for (const row of r.rows) {
      const next = normalize(row.recipient);
      dist[next] = (dist[next] || 0) + 1;
      if (next !== row.recipient) changes.push({ id: row.id, from: row.recipient, to: next });
    }
    console.log(`\n=== ${tbl}: ${r.rows.length} rows, ${changes.length} to change ===`);
    console.log('resulting distribution:', JSON.stringify(dist, (k, v) => v, 2));
    if (APPLY) {
      const batch = changes.map((c) => ({ sql: `UPDATE ${tbl} SET recipient = ? WHERE id = ?`, args: [c.to, c.id] }));
      // chunk to avoid huge single batch
      for (let i = 0; i < batch.length; i += 100) {
        await turso.batch(batch.slice(i, i + 100));
      }
      console.log(`APPLIED ${changes.length} updates to ${tbl}.`);
    } else {
      // show a sample of non-canonical -> mapping
      const sample = [...new Map(changes.map((c) => [String(c.from), c.to])).entries()].slice(0, 40);
      console.log('sample mappings (from -> to):');
      sample.forEach(([f, t]) => console.log(`  ${JSON.stringify(f)} -> ${t}`));
    }
  }
  console.log(APPLY ? '\nDone (applied).' : '\nDRY RUN. Re-run with --apply to write changes.');
}
run().catch((e) => { console.error(e); process.exit(1); });
