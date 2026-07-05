import { test } from "node:test";
import assert from "node:assert/strict";
import { listDesigns, resolveDesign, randomDesign, loadTemplateHtml } from "../src/templates.mjs";

test("classic design is registered", () => {
  const d = resolveDesign("classic");
  assert.ok(d);
  assert.equal(d.id, "classic");
  assert.ok(d.formats.includes("portrait"));
});

test("resolveDesign returns null for unknown id", () => {
  assert.equal(resolveDesign("nope"), null);
});

test("randomDesign is deterministic with a seed", () => {
  assert.equal(randomDesign(0).id, listDesigns()[0].id);
});

test("classic template file has all required placeholders", () => {
  const html = loadTemplateHtml("classic");
  for (const token of ["{{WIDTH}}", "{{HEIGHT}}", "{{TITLE}}", "{{HEADING}}", "{{PARAGRAPHS}}", "{{SENDER}}"]) {
    assert.ok(html.includes(token), `missing ${token}`);
  }
});
