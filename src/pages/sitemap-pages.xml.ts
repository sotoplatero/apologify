import type { APIRoute } from "astro";
import { getAllPublicSlugs } from "../lib/apologyPages";

// Dynamic sitemap for published apology pages. The build-time @astrojs/sitemap
// only captures static routes; every /sorry/[slug] is DB-backed (prerender=false)
// and would otherwise be uncrawlable. Referenced from robots.txt.
export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? "https://apologify.com/").replace(/\/+$/, "");
  let pages: { slug: string; createdAt?: string }[] = [];
  try {
    pages = await getAllPublicSlugs();
  } catch (_) {
    pages = [];
  }

  const urls = pages
    .map((p) => {
      const loc = `${base}/sorry/${p.slug}`;
      let lastmod = "";
      if (p.createdAt) {
        const d = new Date(p.createdAt.includes("T") ? p.createdAt : p.createdAt.replace(" ", "T") + "Z");
        if (!isNaN(d.getTime())) lastmod = `<lastmod>${d.toISOString()}</lastmod>`;
      }
      return `  <url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
};
