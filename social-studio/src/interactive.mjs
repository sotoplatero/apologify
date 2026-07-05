import { readFileSync } from "node:fs";
import { join } from "node:path";
import { select, input, confirm, checkbox } from "@inquirer/prompts";
import { loadScenarios } from "./scenarios.mjs";
import { generateContent, normalizeContent } from "./content.mjs";
import { renderHtmlToPng, FORMATS } from "./render.mjs";
import { fetchDesigns, fetchCardHtml } from "./appclient.mjs";
import { listAccounts, uploadImage, buildPostBody, createPost } from "./publish.mjs";

// Interactive wizard: run `npm run studio` with no flags to walk through
// scenario → design → format → content → action step by step.
export async function runInteractive({ appUrl, studioKey }) {
  console.log(`\n📮 Apologify Social Studio  ·  app: ${appUrl}\n`);

  const designs = await fetchDesigns(appUrl);
  const scenarios = loadScenarios();

  // 1) Scenario or custom
  const pick = await select({
    message: "What are you apologizing for?",
    choices: [
      ...scenarios.map((s) => ({ name: `${s.recipient} — ${s.situation}`, value: s.id })),
      { name: "✍️  Custom — type your own", value: "__custom__" },
    ],
  });

  let recipient, situation, tone, baseDesign, baseFormat;
  if (pick === "__custom__") {
    recipient = await input({ message: "Who is it for?", validate: (v) => !!v.trim() || "Required" });
    situation = await input({ message: "What happened?", validate: (v) => !!v.trim() || "Required" });
    tone = await select({
      message: "Tone",
      choices: ["sincere", "heartfelt", "light", "formal"].map((t) => ({ name: t, value: t })),
    });
  } else {
    const s = scenarios.find((x) => x.id === pick);
    ({ recipient, situation, tone } = s);
    baseDesign = s.design;
    baseFormat = s.format;
  }

  // 2) Design (from the app — single source of truth)
  const designChoice = await select({
    message: "Design",
    default: baseDesign ?? "__random__",
    choices: [
      { name: "🎲 Random", value: "__random__" },
      ...designs.map((d) => ({ name: `${d.emoji ?? " "} ${d.label}`, value: d.id })),
    ],
  });
  const design =
    designChoice === "__random__"
      ? designs[Math.floor(Math.random() * designs.length)].id
      : designChoice;

  // 3) Format
  const format = await select({
    message: "Format",
    default: baseFormat ?? "portrait",
    choices: [
      { name: "Portrait 1080×1350 (IG feed, Pinterest)", value: "portrait" },
      { name: "Square 1080×1080 (IG, X)", value: "square" },
      { name: "Story 1080×1920 (Stories/Reels)", value: "story" },
    ],
  });

  // 4) Content source
  const hasAI = !!process.env.ANTHROPIC_API_KEY;
  const contentMode = await select({
    message: "Apology text + captions",
    choices: [
      ...(hasAI ? [{ name: "Generate with Claude Haiku 4.5", value: "ai" }] : []),
      { name: "Load a JSON content file", value: "file" },
    ],
  });

  let content;
  if (contentMode === "ai") {
    console.log("\nWriting with Claude Haiku 4.5…");
    content = await generateContent({ recipient, situation, tone, lang: "en" });
  } else {
    const path = await input({ message: "Path to content JSON", default: "out/content.json" });
    content = normalizeContent(JSON.parse(readFileSync(path, "utf8")), recipient);
  }

  // Render the real app design
  console.log("Rendering the real app design…");
  const html = await fetchCardHtml(appUrl, studioKey, {
    theme: design,
    title: content.title,
    to: recipient,
    message: content.paragraphs.join("\n\n"),
    sender: content.senderName,
  });
  const outPath = join(process.cwd(), "out", `${design}-${format}.png`);
  await renderHtmlToPng(html, format, outPath);

  console.log(`\n🖼  Image → ${outPath}`);
  console.log(`\n📝 Caption:\n${content.captions.default}\n${content.captions.hashtags.join(" ")}\n`);

  // 5) Action
  const action = await select({
    message: "What now?",
    choices: [
      { name: "Keep the image only (dry run)", value: "dry" },
      { name: "Save as draft in Post Bridge", value: "draft" },
      { name: "Publish live now", value: "publish" },
    ],
  });
  if (action === "dry") {
    console.log("Done — image saved, nothing published.");
    return;
  }

  if (!process.env.POST_BRIDGE_API_KEY) {
    console.log("POST_BRIDGE_API_KEY not set — cannot publish. Image is saved. Set it in .env to publish.");
    return;
  }

  const accounts = await listAccounts();
  if (!accounts.length) {
    console.log("No connected accounts in Post Bridge. Connect some, then try again.");
    return;
  }
  const accountIds = await checkbox({
    message: "Post to which accounts?",
    choices: accounts.map((a) => ({ name: `${a.platform} @${a.username}`, value: a.id, checked: true })),
    validate: (v) => v.length > 0 || "Pick at least one",
  });

  const publish = action === "publish";
  if (publish) {
    const ok = await confirm({ message: `Publish LIVE now to ${accountIds.length} account(s)?`, default: false });
    if (!ok) { console.log("Aborted — nothing published (image saved)."); return; }
  }

  console.log("Uploading to Post Bridge…");
  const mediaId = await uploadImage(outPath);
  const post = await createPost(
    buildPostBody({ caption: content.captions.default, mediaId, accountIds, captions: content.captions, publish, accounts })
  );
  console.log(`${publish ? "PUBLISHED" : "DRAFT"} — post ${post.id || "(see dashboard)"}. Review at post-bridge.com/dashboard.`);
}
