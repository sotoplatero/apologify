import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

const BASE = "https://api.post-bridge.com";

function key() {
  const k = process.env.POST_BRIDGE_API_KEY;
  if (!k) throw new Error("POST_BRIDGE_API_KEY not set. Get one at https://www.post-bridge.com/dashboard/api-keys");
  return k;
}
function headers() {
  return { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" };
}
async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers(), ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`Post Bridge ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function listAccounts() {
  const data = await api("/v1/social-accounts");
  return Array.isArray(data) ? data : data.data || [];
}

export async function uploadImage(pngPath) {
  const size = statSync(pngPath).size;
  const created = await api("/v1/media/create-upload-url", {
    method: "POST",
    body: JSON.stringify({ mime_type: "image/png", size_bytes: size, name: basename(pngPath) }),
  });
  const put = await fetch(created.upload_url, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: readFileSync(pngPath),
  });
  if (!put.ok) throw new Error(`Media upload failed → ${put.status}: ${await put.text()}`);
  return created.media_id;
}

export function buildPostBody({ caption, mediaId, accountIds, captions = {}, scheduleAt, publish = false, accounts = [] }) {
  const body = {
    caption,
    media: [mediaId],
    social_accounts: accountIds,
    is_draft: !publish,
  };
  if (scheduleAt) body.scheduled_at = scheduleAt;
  const overrides = [];
  for (const a of accounts) {
    if (!accountIds.includes(a.id)) continue;
    if (a.platform === "twitter" && captions.x) overrides.push({ account_id: a.id, caption: captions.x });
    if (a.platform === "linkedin" && captions.linkedin) overrides.push({ account_id: a.id, caption: captions.linkedin });
  }
  if (overrides.length) body.account_configurations = { account_configurations: overrides };
  return body;
}

export async function createPost(body) {
  return api("/v1/posts", { method: "POST", body: JSON.stringify(body) });
}
