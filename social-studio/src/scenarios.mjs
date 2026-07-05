import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANK = join(HERE, "..", "scenarios.json");

export function loadScenarios() {
  return JSON.parse(readFileSync(BANK, "utf8"));
}

/**
 * Resolve a post's parameters from a scenario + CLI overrides.
 * @param opts CLI options (scenario/topic/recipient/tone/design/format).
 * @param designIds Valid design ids from the app (single source of truth). An
 *   invalid/absent design falls back to a random one from this list.
 */
export function resolveScenario(opts = {}, designIds = []) {
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
  const wanted = opts.design || base.design;
  let design = wanted;
  if (!design || (designIds.length && !designIds.includes(design))) {
    design = designIds.length ? designIds[Math.floor(Math.random() * designIds.length)] : (wanted || "classic");
  }
  const format = opts.format || base.format || "portrait";
  return { recipient, situation, tone, design, format };
}
