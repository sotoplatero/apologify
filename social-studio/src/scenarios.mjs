import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveDesign, randomDesign } from "./templates.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANK = join(HERE, "..", "scenarios.json");

export function loadScenarios() {
  return JSON.parse(readFileSync(BANK, "utf8"));
}

export function resolveScenario(opts = {}) {
  const bank = loadScenarios();
  let base = {};
  if (opts.scenario === "random") base = bank[Math.floor(Math.random() * bank.length)];
  else if (opts.scenario) {
    base = bank.find((s) => s.id === opts.scenario) || {};
    if (!base.id) throw new Error(`Unknown scenario: ${opts.scenario}`);
  }
  const recipient = opts.recipient || base.recipient;
  const situation = opts.topic || base.situation;
  const tone = opts.tone || base.tone || "sincere";
  if (!recipient || !situation) {
    throw new Error("Need a scenario or --recipient + --topic to know what to write.");
  }
  const designId = opts.design || base.design;
  const design = (designId && resolveDesign(designId)) ? designId : randomDesign().id;
  const format = opts.format || base.format || "portrait";
  return { recipient, situation, tone, design, format };
}
