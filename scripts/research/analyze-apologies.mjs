// Apology study: classify what people apologize for, from the "what happened"
// text users typed into the generator (letters.source = 'generated').
//
//   node scripts/research/analyze-apologies.mjs          # classify (cached) + aggregate
//
// Per-letter classifications are cached in scripts/research/.cache/ (gitignored)
// so re-runs don't re-bill. Only AGGREGATES are written to the repo
// (src/data/apology-study.json) — never individual texts.
import { createClient } from '@libsql/client';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const MODEL = 'claude-haiku-4-5';
const BATCH = 40;
const CACHE = path.resolve('scripts/research/.cache/classifications.json');
const OUT = path.resolve('src/data/apology-study.json');

export const CATEGORIES = {
  silence: 'Ignoring them, going silent or not replying',
  hurtful_words: 'Saying something hurtful or insulting',
  temper: 'Losing my temper, yelling or picking a fight',
  not_there: 'Not being there for them / too busy for them',
  broken_promise: 'Breaking a promise or not showing up',
  forgot_date: 'Forgetting a birthday, anniversary or special day',
  jealousy: 'Jealousy, suspicion or being controlling',
  dishonesty: 'Lying, hiding something or breaking trust',
  cheating: 'Cheating, or flirting / talking with someone else',
  disrespect: 'Being rude or disrespectful',
  misunderstanding: 'A misunderstanding (no specific act named)',
  money: 'Money: borrowing, not repaying, spending',
  work_school: 'Work or school: late, missed tasks, behavior in class',
  other: 'Something else',
};

const RECIPIENT_GROUPS = {
  partner: ['romantic', 'girlfriend', 'boyfriend', 'wife', 'husband', 'partner', 'ex'],
  friend: ['friend', 'classmate'],
  family: ['mother', 'father', 'son', 'daughter', 'sibling', 'grandmother', 'grandfather'],
  work: ['boss', 'manager', 'supervisor', 'colleague', 'client', 'teacher', 'professor', 'mentor', 'hr', 'vendor', 'public', 'employee', 'investor'],
};
const groupOf = (r) => Object.keys(RECIPIENT_GROUPS).find((g) => RECIPIENT_GROUPS[g].includes(r)) ?? 'other';

const SYSTEM = `You classify short texts people typed into an apology-letter tool to describe what they are apologizing for. Texts may be in any language, misspelled, or not real apologies.

For each item return:
- id: the given id
- valid: false if it is not a genuine description of something to apologize for (jokes like violent/absurd fiction, spam, greetings, emails, gibberish, a bare name, or requests unrelated to apologizing); otherwise true
- category: exactly one of ${Object.keys(CATEGORIES).join(', ')} — the main act being apologized for. Definitions: ${Object.entries(CATEGORIES).map(([k, v]) => `${k} = ${v}`).join('; ')}. Use "misunderstanding" only when no specific act is named. Use "other" when valid but none fit.
- digital: true if the issue involves phones, texting, calls, chats, social media or blocking
- lang: ISO 639-1 code of the text's main language (e.g. en, hi, tl, id, es); use "en" for English mixed with a few local words

Respond with ONLY a JSON array of objects, no prose.`;

async function classify(items, client) {
  const userPrompt = JSON.stringify(items.map((i) => ({ id: i.id, text: i.context.slice(0, 600) })));
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const json = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
  return JSON.parse(json);
}

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const { rows } = await db.execute(
  "SELECT id, recipient, tone, context, created_at FROM letters WHERE source = 'generated'",
);
const letters = rows.map((r) => ({ id: Number(r.id), recipient: String(r.recipient), tone: String(r.tone), context: String(r.context ?? ''), created_at: String(r.created_at) }));

fs.mkdirSync(path.dirname(CACHE), { recursive: true });
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const todo = letters.filter((l) => !cache[l.id]);
if (todo.length) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    let result;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { result = await classify(batch, client); break; }
      catch (e) { console.warn(`batch ${i / BATCH + 1} attempt ${attempt} failed: ${e.message}`); }
    }
    for (const r of result ?? []) if (CATEGORIES[r.category] || r.valid === false) cache[r.id] = r;
    fs.writeFileSync(CACHE, JSON.stringify(cache));
    console.log(`classified ${Math.min(i + BATCH, todo.length)}/${todo.length}`);
  }
}

// ---- Aggregate ----
const joined = letters.map((l) => ({ ...l, c: cache[l.id] })).filter((l) => l.c);
const valid = joined.filter((l) => l.c.valid !== false && CATEGORIES[l.c.category]);
const pct = (n, d) => Math.round((1000 * n) / d) / 10;
const countBy = (arr, key) => arr.reduce((m, x) => ((m[key(x)] = (m[key(x)] || 0) + 1), m), {});
const ranked = (counts, total) =>
  Object.entries(counts)
    .map(([key, n]) => ({ key, label: CATEGORIES[key] ?? key, n, pct: pct(n, total) }))
    .sort((a, b) => b.n - a.n);

const byCategory = ranked(countBy(valid, (l) => l.c.category), valid.length);
const groups = {};
for (const g of ['partner', 'friend', 'family', 'work']) {
  const sub = valid.filter((l) => groupOf(l.recipient) === g);
  groups[g] = { n: sub.length, top: ranked(countBy(sub, (l) => l.c.category), sub.length).slice(0, 5) };
}
const recipientGroups = ranked(countBy(valid, (l) => groupOf(l.recipient)), valid.length).map(({ key, n, pct: p }) => ({ key, n, pct: p }));
const tones = ['heartfelt', 'apologetic', 'emotional', 'formal', 'casual', 'remorseful', 'humorous', 'professional'];
const toneCounts = countBy(valid.filter((l) => tones.includes(l.tone)), (l) => l.tone);
const toneTotal = Object.values(toneCounts).reduce((a, b) => a + b, 0);
const digital = valid.filter((l) => l.c.digital).length;
const digitalPartner = valid.filter((l) => groupOf(l.recipient) === 'partner');
const words = valid.map((l) => l.context.trim().split(/\s+/).filter(Boolean).length).sort((a, b) => a - b);
const median = words[Math.floor(words.length / 2)];
const vague = valid.filter((l) => l.c.category === 'misunderstanding').length;
const langs = ranked(countBy(valid, (l) => l.c.lang || 'en'), valid.length).slice(0, 6).map(({ key, n, pct: p }) => ({ key, n, pct: p }));
const dates = letters.map((l) => l.created_at).sort();

const study = {
  generatedAt: new Date().toISOString().slice(0, 10),
  model: MODEL,
  sample: {
    collected: letters.length,
    analyzed: valid.length,
    excluded: joined.length - valid.length,
    unclassified: letters.length - joined.length,
    from: dates[0]?.slice(0, 10),
    to: dates[dates.length - 1]?.slice(0, 10),
  },
  byCategory,
  recipientGroups,
  groups,
  tones: ranked(toneCounts, toneTotal).map(({ key, n, pct: p }) => ({ key, n, pct: p })),
  digital: { n: digital, pct: pct(digital, valid.length), partnerPct: pct(digitalPartner.filter((l) => l.c.digital).length, digitalPartner.length) },
  vaguePct: pct(vague, valid.length),
  medianWords: median,
  shortPct: pct(words.filter((w) => w <= 10).length, words.length),
  languages: langs,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(study, null, 2) + '\n');
console.log(JSON.stringify({ sample: study.sample, top: byCategory.slice(0, 6), digital: study.digital, vaguePct: study.vaguePct, medianWords: median }, null, 2));
