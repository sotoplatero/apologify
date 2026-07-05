import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildHtml, renderCard, pngSize, FORMATS, inlineFonts } from "../src/render.mjs";

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

test("inlineFonts embeds present woff2 as data URI and leaves absent ones untouched", () => {
  const dir = mkdtempSync(join(tmpdir(), "fonts-"));
  writeFileSync(join(dir, "fraunces.woff2"), Buffer.from([1, 2, 3, 4]));
  const html = 'a{src:url("_fonts/fraunces.woff2")} b{src:url("_fonts/missing.woff2")}';
  const out = inlineFonts(html, dir);
  assert.ok(out.includes("data:font/woff2;base64,"), "present font inlined");
  assert.ok(out.includes('url("_fonts/missing.woff2")'), "absent font left as-is");
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
