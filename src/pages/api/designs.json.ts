import type { APIRoute } from "astro";
import { listThemes } from "../../lib/themes.js";

export const prerender = false;

// Public list of available design ids/labels — the single source of truth for
// the Social Studio tool's design catalog (no hardcoded list in the tool).
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(listThemes()), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
