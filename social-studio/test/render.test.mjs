import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildHtml, renderCard, pngSize, FORMATS } from "../src/render.mjs";

test("buildHtml substitutes all placeholders", () => {
  const html = buildHtml("classic",
    { title: "Sorry", heading: "Dear Mia,", paragraphs: ["I messed up"], senderName: "Sam" },
    "portrait");
  assert.ok(!html.includes("{{"), "no unresolved placeholders remain");
  assert.ok(html.includes("1080px"));
  assert.ok(html.includes("Dear Mia,"));
  assert.ok(html.includes("I messed up"));
});

test("buildHtml omits heading/sender when empty", () => {
  const html = buildHtml("classic",
    { title: "Sorry", heading: null, paragraphs: ["x"], senderName: "" }, "portrait");
  assert.ok(!html.includes("class=\"heading\""));
  assert.ok(!html.includes("class=\"sender\""));
});

test("buildHtml escapes html in title, heading and sender", () => {
  const html = buildHtml("classic",
    { title: "Tom & Jerry", heading: "Dear <b>Mia</b>,", paragraphs: ["ok"], senderName: 'Sam"' },
    "portrait");
  assert.ok(html.includes("Tom &amp; Jerry"));
  assert.ok(html.includes("Dear &lt;b&gt;Mia&lt;/b&gt;,"));
  assert.ok(html.includes('Sam&quot;') || html.includes('Sam"'));
  assert.ok(!html.includes("<b>Mia</b>"));
});

test("renderCard produces a PNG at exact format dimensions", async () => {
  const out = join(mkdtempSync(join(tmpdir(), "studio-")), "card.png");
  await renderCard("classic",
    { title: "For missing the night", heading: "Dear Mia,", paragraphs: ["I wasn't there and I'm sorry."], senderName: "Sam" },
    "portrait", out);
  const { width, height } = pngSize(out);
  assert.equal(width, FORMATS.portrait.w);
  assert.equal(height, FORMATS.portrait.h);
});
