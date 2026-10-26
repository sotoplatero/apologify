import type { APIRoute } from 'astro';
import { issues, issueUrl, sortedItems, formatScore } from '../../lib/news';

export const prerender = true;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://apologify.com')).href.replace(/\/$/, '');
  const items = issues
    .map((issue) => {
      const url = `${base}${issueUrl(issue)}`;
      const cover = `${base}${issue.image?.src ?? `/news-og/${issue.slug}.png`}`;
      const html =
        `<p><img src="${esc(cover)}" alt="" /></p>` +
        (issue.intro ? `<p>${esc(issue.intro)}</p>` : '') +
        sortedItems(issue)
          .map((i) => `<p><strong>${formatScore(i.score)} · ${esc(i.who)}</strong> — ${esc(i.verdict)}</p>`)
          .join('');
      return `<item>
<title>${esc(issue.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${new Date(issue.date + 'T12:00:00Z').toUTCString()}</pubDate>
<description>${esc(html)}</description>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Apology News</title>
<link>${base}/news</link>
<atom:link href="${base}/news/rss.xml" rel="self" type="application/rss+xml" />
<description>The week's public apologies, scored.</description>
<language>en</language>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
