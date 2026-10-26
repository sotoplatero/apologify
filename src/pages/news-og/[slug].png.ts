import type { APIRoute } from "astro";
import { getIssue } from "../../lib/news";
import { renderNewsImage } from "../../lib/server/shareImage";

// Fallback share image for an Apology News issue without a cover illustration.
// Issues only change with a deploy, so the per-deploy ISR cache is correct here.
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const issue = params.slug ? getIssue(params.slug) : undefined;
  if (!issue) return new Response("Not found", { status: 404 });
  return renderNewsImage(issue);
};
