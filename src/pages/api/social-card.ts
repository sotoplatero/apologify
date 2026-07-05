import type { APIRoute } from "astro";

export const prerender = false;

/**
 * POST /api/social-card — protected by the `x-studio-key` header (== STUDIO_API_KEY).
 * Body: { theme, title, to, message, sender }.
 *
 * Renders the REAL design template (single source of truth) by server-side
 * fetching the gated /studio/card page, inlines its same-origin stylesheets,
 * and returns self-contained HTML. The standalone Social Studio tool screenshots
 * this HTML. No public, browser-navigable content URL is exposed.
 */

const FONT_LINK = /https:\/\/fonts\.(googleapis|gstatic)\.com/;

async function inlineSameOriginCss(html: string, origin: string): Promise<string> {
  const linkRe = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi;
  const links = html.match(linkRe) || [];
  for (const tag of links) {
    const href = (tag.match(/\bhref=["']([^"']+)["']/) || [])[1];
    if (!href || FONT_LINK.test(href)) continue; // leave external font CSS as <link>
    let abs: string;
    try {
      abs = new URL(href, origin).href;
    } catch {
      continue;
    }
    if (new URL(abs).origin !== origin) continue; // only inline same-origin CSS
    try {
      const res = await fetch(abs);
      if (!res.ok) continue;
      const css = await res.text();
      html = html.replace(tag, `<style>${css}</style>`);
    } catch {
      // leave the link in place if the fetch fails
    }
  }
  return html;
}

export const POST: APIRoute = async ({ request, url }) => {
  const expected = import.meta.env.STUDIO_API_KEY;
  const provided = request.headers.get("x-studio-key");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const params = new URLSearchParams();
  params.set("theme", String(body.theme ?? "classic"));
  params.set("title", String(body.title ?? ""));
  params.set("to", String(body.to ?? ""));
  params.set("message", String(body.message ?? ""));
  params.set("sender", String(body.sender ?? ""));

  const pageUrl = new URL(`/studio/card?${params.toString()}`, url.origin);
  const res = await fetch(pageUrl, { headers: { "x-studio-key": expected } });
  if (!res.ok) {
    return new Response(JSON.stringify({ error: `render failed (${res.status})` }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  let html = await res.text();
  html = await inlineSameOriginCss(html, url.origin);
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};
