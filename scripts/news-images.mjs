// Adds the news photo to each case of an Apology News issue: the og:image of
// its source article (falling back to the statement page), hot-linked with a
// credit to the outlet. The n8n Draft workflow does the same for new issues.
//
//   node scripts/news-images.mjs 2026-w43 [--force]
import fs from 'node:fs/promises';
import path from 'node:path';

const [week, flag] = process.argv.slice(2);
if (!/^\d{4}-w\d{2}$/.test(week || '')) {
  console.error('usage: node scripts/news-images.mjs <YYYY-wNN> [--force]');
  process.exit(1);
}

const UA = 'Mozilla/5.0 (compatible; ApologifyBot/1.0; +https://apologify.com/news)';

export function ogImage(html, pageUrl) {
  const metas = html.match(/<meta[^>]+>/gi) || [];
  for (const key of ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']) {
    for (const m of metas) {
      const prop = m.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
      const content = m.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
      if (prop === key && content) {
        try {
          const url = new URL(content.replace(/&amp;/g, '&'), pageUrl);
          if (url.protocol === 'https:') return url.href;
        } catch {}
      }
    }
  }
  return null;
}

async function imageFor(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return ogImage(await res.text(), res.url);
  } catch {
    return null;
  }
}

const file = path.join('src/data/news', week, 'issue.json');
const issue = JSON.parse(await fs.readFile(file, 'utf8'));
for (const item of issue.items) {
  if (item.image && flag !== '--force') continue;
  let src = await imageFor(item.sourceUrl);
  let credit = item.sourceName;
  if (!src && item.statementUrl) {
    src = await imageFor(item.statementUrl);
    credit = new URL(item.statementUrl).hostname.replace(/^www\./, '');
  }
  if (src) item.image = { src, credit };
  console.log(`${item.id}: ${src ?? '— no image'}`);
}
await fs.writeFile(file, JSON.stringify(issue, null, 2) + '\n');
