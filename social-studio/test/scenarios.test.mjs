import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveScenario, loadScenarios } from "../src/scenarios.mjs";

test("bank loads and entries have required fields", () => {
  const all = loadScenarios();
  assert.ok(all.length >= 3);
  for (const s of all) {
    assert.ok(s.id && s.recipient && s.situation && s.tone);
  }
});

const DESIGN_IDS = ["classic", "typewriter", "starry", "watercolor", "ransom", "sticky-note"];

test("ad-hoc topic overrides scenario and fills defaults", () => {
  const r = resolveScenario(
    { topic: "I broke your vase", recipient: "my roommate", tone: "sincere", design: "typewriter", format: "square" },
    DESIGN_IDS);
  assert.equal(r.situation, "I broke your vase");
  assert.equal(r.recipient, "my roommate");
  assert.equal(r.design, "typewriter");
  assert.equal(r.format, "square");
});

test("invalid design falls back to one from the app's list", () => {
  const r = resolveScenario(
    { topic: "x", recipient: "y", design: "not-a-real-design" },
    DESIGN_IDS);
  assert.ok(DESIGN_IDS.includes(r.design), "falls back to a valid design id");
});

test("scenario by id is resolved and format defaults to portrait", () => {
  const first = loadScenarios()[0];
  const r = resolveScenario({ scenario: first.id }, DESIGN_IDS);
  assert.equal(r.situation, first.situation);
  assert.ok(["portrait", "square", "story"].includes(r.format));
});
