import { Command } from "commander";

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
console.log("studio starting with options:", opts);
