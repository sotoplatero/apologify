// Generates the cover illustration of an Apology News issue with OpenAI and
// wires it into the issue: public/news/<slug>.webp + issue.json "image".
// The n8n Draft workflow does the same for new issues; this is for issues
// created or fixed by hand.
//
//   node scripts/news-cover.mjs 2026-w43 [--force]
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import slugify from 'slugify';

const MODEL = 'gpt-image-2.5-flare';

const [week, flag] = process.argv.slice(2);
if (!/^\d{4}-w\d{2}$/.test(week || '')) {
  console.error('usage: node scripts/news-cover.mjs <YYYY-wNN> [--force]');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  process.exit(1);
}

const issuePath = path.join('src/data/news', week, 'issue.json');
const issue = JSON.parse(await fs.readFile(issuePath, 'utf8'));
issue.slug ||= slugify(issue.title, { lower: true, strict: true }).slice(0, 80).replace(/-+$/, '');
if (issue.image && flag !== '--force') {
  console.log(`${week} already has a cover (${issue.image.src}); use --force to replace it`);
  process.exit(0);
}

export function coverPrompt(issue) {
  const best = issue.items.find((i) => i.slot === 'best');
  const worst = issue.items.find((i) => i.slot === 'worst');
  const themes = [best, worst].filter(Boolean).map((i) => i.headline).join('; ');
  return [
    'Editorial cover photograph for a weekly newsletter that scores public apologies.',
    `This week's stories: ${themes}.`,
    'Show the stories through one or two symbolic objects only (a folded handwritten note, a fountain pen, a sealed envelope, a vintage microphone, a typed press statement, a single cut flower), never people.',
    'Style: luxury fashion-magazine still life photograph on pure white seamless paper, soft directional daylight with crisp long shadows, minimal composition with vast empty white space, the objects slightly off-centre, refined and glamorous, restrained natural colour, medium-format photography.',
    'Absolutely no text, letters, numbers, logos, brand marks or recognizable real people.',
  ].join(' ');
}

const res = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: MODEL,
    prompt: coverPrompt(issue),
    size: '1536x1024',
    quality: 'medium',
    output_format: 'webp',
    output_compression: 70,
    n: 1,
  }),
});
const json = await res.json();
if (!res.ok) {
  console.error('OpenAI error', res.status, JSON.stringify(json.error ?? json));
  process.exit(1);
}

const file = path.join('public/news', `${issue.slug}.webp`);
await fs.mkdir(path.dirname(file), { recursive: true });
await fs.writeFile(file, Buffer.from(json.data[0].b64_json, 'base64'));

const best = issue.items.find((i) => i.slot === 'best');
issue.image = {
  src: `/news/${issue.slug}.webp`,
  alt: `Cover photograph for Apology News: ${best ? best.headline : issue.title}`,
};
await fs.writeFile(issuePath, JSON.stringify(issue, null, 2) + '\n');
console.log(`cover → ${file} (${(await fs.stat(file)).size} bytes), issue updated`);
