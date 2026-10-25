import type { APIRoute } from "astro";
import { getApologyPageBySlug } from "../../lib/apologyPages";
import { isLikelySlug } from "../../lib/slug.js";
import { renderShareImage } from "../../lib/server/shareImage";

// Link-preview image (og:image) for an apology page.
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug || !isLikelySlug(slug)) return new Response("Not found", { status: 404 });
  const page = await getApologyPageBySlug(slug);
  if (!page) return new Response("Not found", { status: 404 });
  return renderShareImage(page, "og");
};
