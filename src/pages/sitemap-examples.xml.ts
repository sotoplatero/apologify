import type { APIRoute } from "astro";
import { turso } from "../lib/turso";

// Dynamic sitemap for the example-letter library (/examples/[recipient] and
// /examples/[recipient]/[slug]). Those routes are DB-backed (prerender=false),
// so @astrojs/sitemap never sees them. Referenced from robots.txt.
export const prerender = false;

const toIso = (value: unknown) => {
  if (!value) return "";
  const raw = String(value);
  const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? "" : d.toISOString();
};

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? "https://apologify.com/").replace(/\/+$/, "");
  let rows: { recipient: string; slug: string; created_at: unknown }[] = [];
  try {
    const result = await turso!.execute(
      "SELECT recipient, slug, created_at FROM letters ORDER BY created_at DESC",
    );
    rows = result.rows as any;
  } catch (_) {
    rows = [];
  }

  // One entry per recipient hub, dated by its newest letter.
  const hubs = new Map<string, string>();
  for (const r of rows) {
    if (!hubs.has(r.recipient)) hubs.set(r.recipient, toIso(r.created_at));
  }

  const entry = (loc: string, lastmod: string) =>
    `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;

  const urls = [
    ...[...hubs].map(([recipient, lastmod]) => entry(`${base}/examples/${recipient}`, lastmod)),
    ...rows.map((r) =>
      entry(`${base}/examples/${r.recipient}/${encodeURIComponent(r.slug)}`, toIso(r.created_at)),
    ),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
};
