import "dotenv/config";
import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { join } from "node:path";
import { listDesigns } from "./templates.mjs";
import { loadScenarios, resolveScenario } from "./scenarios.mjs";
import { generateContent } from "./content.mjs";
import { renderCard } from "./render.mjs";
import { listAccounts, uploadImage, buildPostBody, createPost } from "./publish.mjs";

const program = new Command();
program
  .name("studio")
  .description("Apologify Social Studio — render design cards and publish to social networks")
  .option("--list", "list designs, scenarios and connected accounts")
  .option("--design <id>", "design id (default: from scenario or random)")
  .option("--scenario <id>", "scenario id or 'random'")
  .option("--topic <text>", "what the apology is about (ad-hoc, no scenario)")
  .option("--recipient <text>", "who it is for (ad-hoc)")
  .option("--tone <text>", "tone, e.g. sincere / light / formal")
  .option("--format <format>", "portrait | square | story", "portrait")
  .option("--lang <code>", "content language", "en")
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
    console.log("\nDesigns:");
    for (const d of listDesigns()) console.log(`  ${d.id.padEnd(14)} ${d.label}`);
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

  const scenario = resolveScenario(opts);
  console.log(`Scenario: ${scenario.recipient} — ${scenario.situation} (${scenario.tone})`);
  console.log(`Design: ${scenario.design}  Format: ${scenario.format}`);

  console.log("Writing content with Claude Haiku 4.5…");
  const content = await generateContent({ ...scenario, lang: opts.lang });

  const outPath = join(process.cwd(), "out", `${scenario.design}-${scenario.format}.png`);
  console.log("Rendering image…");
  await renderCard(scenario.design, content, scenario.format, outPath);
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
