import type { APIRoute } from "astro";
import { getApologyPageBySlug } from "../../lib/apologyPages";
import { isLikelySlug } from "../../lib/slug.js";
import { apologyHeading } from "../../lib/display.js";
import { renderLetterImage } from "../../lib/server/shareImage";

// The full letter as a downloadable image (the Download buttons).
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug || !isLikelySlug(slug)) return new Response("Not found", { status: 404 });
  const page = await getApologyPageBySlug(slug);
  if (!page) return new Response("Not found", { status: 404 });
  return renderLetterImage(page, apologyHeading(page.recipientName));
};
