import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { select, input, confirm } from "@inquirer/prompts";
import { loadScenarios } from "./scenarios.mjs";
import { generateContent, normalizeContent } from "./content.mjs";
import { renderHtmlToPng } from "./render.mjs";
import { fetchDesigns, fetchCardHtml } from "./appclient.mjs";
import { listAccounts, uploadImage, buildPostBody, createPost } from "./publish.mjs";

// Open a file in the OS default viewer (best-effort, non-blocking).
function openFile(path) {
  const cmd = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", path] : [path];
  try { spawn(cmd, args, { detached: true, stdio: "ignore" }).unref(); } catch { /* ignore */ }
}

/**
 * Streamlined interactive flow: one choice → generate (no publish) → optionally
 * publish. Smart defaults (AI content, portrait, scenario/random design) keep it
 * to a couple of keystrokes. "Surprise me" is a single Enter.
 */
export async function runInteractive({ appUrl, studioKey }) {
  console.log(`\n📮 Apologify Social Studio  ·  ${appUrl}\n`);

  const designs = await fetchDesigns(appUrl);
  const scenarios = loadScenarios();
  const randomDesign = () => designs[Math.floor(Math.random() * designs.length)].id;
  const validDesign = (id) => (id && designs.some((d) => d.id === id) ? id : randomDesign());

  const pick = await select({
    message: "What are you apologizing for?",
    choices: [
      { name: "🎲 Surprise me", value: "__random__" },
      ...scenarios.map((s) => ({ name: `${s.recipient} — ${s.situation}`, value: s.id })),
      { name: "✍️  Custom…", value: "__custom__" },
    ],
  });

  let recipient, situation, tone, design;
  if (pick === "__custom__") {
    recipient = await input({ message: "Who is it for?", validate: (v) => !!v.trim() || "Required" });
    situation = await input({ message: "What happened?", validate: (v) => !!v.trim() || "Required" });
    tone = "sincere";
    design = randomDesign();
  } else {
    const s = pick === "__random__" ? scenarios[Math.floor(Math.random() * scenarios.length)] : scenarios.find((x) => x.id === pick);
    ({ recipient, situation, tone } = s);
    design = validDesign(s.design);
  }

  // Content: AI when a key is present, otherwise a JSON file.
  let content;
  if (process.env.ANTHROPIC_API_KEY) {
    console.log("\nWriting with Claude Haiku 4.5…");
    content = await generateContent({ recipient, situation, tone, lang: "en" });
  } else {
    const path = await input({ message: "No ANTHROPIC_API_KEY — path to content JSON", default: "out/content.json" });
    content = normalizeContent(JSON.parse(readFileSync(path, "utf8")), recipient);
  }

  const format = "portrait";
  console.log(`Rendering ${design} · ${format}…`);
  const html = await fetchCardHtml(appUrl, studioKey, {
    theme: design,
    title: content.title,
    to: recipient,
    message: content.paragraphs.join("\n\n"),
    sender: content.senderName,
  });
  const outPath = join(process.cwd(), "out", `${design}-${format}.png`);
  await renderHtmlToPng(html, format, outPath);
  openFile(outPath); // show it so you can decide before publishing

  console.log(`\n🖼  ${outPath}`);
  console.log(`\n📝 ${content.captions.default}\n${content.captions.hashtags.join(" ")}\n`);

  // Generate-without-publish is the default; publishing is an opt-in extra step.
  if (!process.env.POST_BRIDGE_API_KEY) {
    console.log("Image saved. (Set POST_BRIDGE_API_KEY in .env to publish from here.)");
    return;
  }
  const action = await select({
    message: "Publish?",
    default: "keep",
    choices: [
      { name: "Keep the image only", value: "keep" },
      { name: "Save as draft in Post Bridge", value: "draft" },
      { name: "Publish live now (all connected accounts)", value: "publish" },
    ],
  });
  if (action === "keep") { console.log("Done — image saved, nothing published."); return; }

  const accounts = await listAccounts();
  if (!accounts.length) { console.log("No connected Post Bridge accounts."); return; }
  const accountIds = accounts.map((a) => a.id);
  const publish = action === "publish";
  if (publish) {
    const ok = await confirm({ message: `Publish LIVE to ${accountIds.length} account(s) now?`, default: false });
    if (!ok) { console.log("Aborted — image saved."); return; }
  }
  console.log("Uploading to Post Bridge…");
  const mediaId = await uploadImage(outPath);
  const post = await createPost(
    buildPostBody({ caption: content.captions.default, mediaId, accountIds, captions: content.captions, publish, accounts })
  );
  console.log(`${publish ? "PUBLISHED" : "DRAFT"} — post ${post.id || "(see dashboard)"}. post-bridge.com/dashboard`);
}
