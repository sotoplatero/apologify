import "dotenv/config";
import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadScenarios, resolveScenario } from "./scenarios.mjs";
import { generateContent, normalizeContent } from "./content.mjs";
import { renderHtmlToPng, FORMATS } from "./render.mjs";
import { fetchDesigns, fetchCardHtml } from "./appclient.mjs";
import { listAccounts, uploadImage, buildPostBody, createPost } from "./publish.mjs";
import { runInteractive } from "./interactive.mjs";

const APP_URL = process.env.APP_URL || "http://localhost:4321";
const STUDIO_KEY = process.env.STUDIO_API_KEY;

const program = new Command();
program
  .name("studio")
  .description("Apologify Social Studio — render real app designs and publish to social networks")
  .option("--list", "list designs (from the app), scenarios and connected accounts")
  .option("--design <id>", "design id (default: from scenario or random)")
  .option("--scenario <id>", "scenario id or 'random'")
  .option("--topic <text>", "what the apology is about (ad-hoc, no scenario)")
  .option("--recipient <text>", "who it is for (ad-hoc)")
  .option("--tone <text>", "tone, e.g. sincere / light / formal")
  .option("--format <format>", "portrait | square | story", "portrait")
  .option("--lang <code>", "content language", "en")
  .option("--content <path>", "use a JSON content file instead of the AI — no ANTHROPIC_API_KEY needed")
  .option("--accounts <csv>", "limit to specific Post Bridge account ids")
  .option("--schedule <iso>", "schedule at ISO datetime (UTC)")
  .option("--publish", "publish live now (default is draft)")
  .option("--dry-run", "generate image + caption only, do not publish");
program.parse();
const opts = program.opts();

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const a = (await rl.question(`${question} (y/N) `)).trim().toLowerCase();
  rl.close();
  return a === "y" || a === "yes";
}

async function main() {
  if (opts.list) {
    console.log(`\nApp: ${APP_URL}`);
    console.log("\nDesigns (from the app):");
    for (const d of await fetchDesigns(APP_URL)) console.log(`  ${d.id.padEnd(14)} ${d.label}`);
    console.log("\nScenarios:");
    for (const s of loadScenarios()) console.log(`  ${s.id.padEnd(12)} ${s.recipient} — ${s.situation}`);
    if (process.env.POST_BRIDGE_API_KEY) {
      console.log("\nConnected accounts:");
      for (const a of await listAccounts()) console.log(`  [${a.id}] ${a.platform} @${a.username}`);
    } else {
      console.log("\n(POST_BRIDGE_API_KEY not set — skipping accounts)");
    }
    return;
  }

  // No content flags → interactive wizard (when attached to a terminal).
  if (!opts.scenario && !opts.topic && !opts.recipient) {
    if (process.stdin.isTTY) {
      await runInteractive({ appUrl: APP_URL, studioKey: STUDIO_KEY });
      return;
    }
    console.log("Pick a scenario or describe the apology. Examples:\n");
    console.log('  npm run studio                                  # interactive wizard');
    console.log('  npm run studio -- --list                        # designs + scenarios');
    console.log('  npm run studio -- --scenario random --dry-run');
    console.log('  npm run studio -- --recipient "my partner" --topic "I forgot our anniversary" --dry-run');
    console.log("\nAdd --publish to post live (draft otherwise). Run with --help for all options.");
    return;
  }

  const designs = await fetchDesigns(APP_URL);
  const designIds = designs.map((d) => d.id);
  const scenario = resolveScenario(opts, designIds);
  if (!Object.keys(FORMATS).includes(scenario.format)) {
    console.error(`Error: invalid --format "${scenario.format}". Valid formats: ${Object.keys(FORMATS).join(", ")}`);
    process.exit(1);
  }
  console.log(`Scenario: ${scenario.recipient} — ${scenario.situation} (${scenario.tone})`);
  console.log(`Design: ${scenario.design}  Format: ${scenario.format}`);

  let content;
  if (opts.content) {
    console.log(`Using content from ${opts.content} (no API key needed)…`);
    content = normalizeContent(JSON.parse(readFileSync(opts.content, "utf8")), scenario.recipient);
  } else {
    console.log("Writing content with Claude Haiku 4.5…");
    content = await generateContent({ ...scenario, lang: opts.lang });
  }

  console.log("Rendering the real app design…");
  const html = await fetchCardHtml(APP_URL, STUDIO_KEY, {
    theme: scenario.design,
    title: content.title,
    to: scenario.recipient,
    message: content.paragraphs.join("\n\n"),
    sender: content.senderName,
  });
  const outPath = join(process.cwd(), "out", `${scenario.design}-${scenario.format}.png`);
  await renderHtmlToPng(html, scenario.format, outPath);
  console.log(`Image → ${outPath}`);
  console.log(`\nCaption:\n${content.captions.default}\n${content.captions.hashtags.join(" ")}\n`);

  if (opts.dryRun) {
    console.log("Dry run — not publishing.");
    return;
  }

  const accounts = await listAccounts();
  const wanted = opts.accounts ? opts.accounts.split(",").map((n) => Number(n.trim())) : accounts.map((a) => a.id);
  const accountIds = accounts.filter((a) => wanted.includes(a.id)).map((a) => a.id);
  if (!accountIds.length) {
    console.log("No matching connected accounts. Connect accounts in Post Bridge or check --accounts.");
    return;
  }

  if (opts.publish) {
    const ok = await confirm(`Publish LIVE now to accounts [${accountIds.join(", ")}]?`);
    if (!ok) { console.log("Aborted."); return; }
  }

  console.log("Uploading image to Post Bridge…");
  const mediaId = await uploadImage(outPath);
  const body = buildPostBody({
    caption: content.captions.default,
    mediaId, accountIds, captions: content.captions,
    scheduleAt: opts.schedule, publish: !!opts.publish, accounts,
  });
  const post = await createPost(body);
  const state = opts.publish ? "PUBLISHED" : opts.schedule ? "SCHEDULED" : "DRAFT";
  console.log(`${state} — post id ${post.id || "(see dashboard)"}. Review at post-bridge.com/dashboard.`);
}

main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
