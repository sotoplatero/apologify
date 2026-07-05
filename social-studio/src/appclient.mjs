// Talks to the Apologify app — the single source of truth for designs and
// rendering. The studio never replicates templates; it asks the app to render
// the real ones and screenshots the result.

/** Fetch the design catalog (ids/labels) from the app. */
export async function fetchDesigns(appUrl) {
  let res;
  try {
    res = await fetch(new URL("/api/designs.json", appUrl));
  } catch (e) {
    throw new Error(`Cannot reach the app at ${appUrl} (${e.message}). Is it running? (pnpm dev / pnpm preview)`);
  }
  if (!res.ok) throw new Error(`Design list failed (${res.status}) at ${appUrl}.`);
  return res.json();
}

/**
 * Ask the app to render a design with content and return self-contained HTML.
 * Protected by the shared STUDIO_API_KEY (x-studio-key header).
 */
export async function fetchCardHtml(appUrl, key, { theme, title, to, message, sender }) {
  if (!key) throw new Error("STUDIO_API_KEY not set — it must match the app's STUDIO_API_KEY.");
  let res;
  try {
    res = await fetch(new URL("/api/social-card", appUrl), {
      method: "POST",
      headers: { "content-type": "application/json", "x-studio-key": key },
      body: JSON.stringify({ theme, title, to, message, sender }),
    });
  } catch (e) {
    throw new Error(`Cannot reach the app at ${appUrl} (${e.message}). Is it running?`);
  }
  if (res.status === 401) throw new Error("Unauthorized — STUDIO_API_KEY does not match the app.");
  if (!res.ok) throw new Error(`Render endpoint failed (${res.status}) at ${appUrl}.`);
  return res.text();
}
