import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listDesigns, loadTemplateHtml } from "../src/templates.mjs";
import { renderCard, pngSize, FORMATS } from "../src/render.mjs";

const SAMPLE = {
  title: "For missing the night that mattered",
  heading: "Dear Mia,",
  paragraphs: ["I know tonight was important to you, and I wasn't there.", "I'm sorry, and I'll prove it in how I act."],
  senderName: "Sam",
};

for (const d of listDesigns()) {
  test(`${d.id}: template has all placeholders`, () => {
    const html = loadTemplateHtml(d.id);
    for (const t of ["{{WIDTH}}", "{{HEIGHT}}", "{{TITLE}}", "{{HEADING}}", "{{PARAGRAPHS}}", "{{SENDER}}"]) {
      assert.ok(html.includes(t), `${d.id} missing ${t}`);
    }
  });

  test(`${d.id}: renders a portrait PNG at 1080x1350`, async () => {
    const out = join(mkdtempSync(join(tmpdir(), "studio-")), `${d.id}.png`);
    await renderCard(d.id, SAMPLE, "portrait", out);
    assert.deepEqual(pngSize(out), { width: FORMATS.portrait.w, height: FORMATS.portrait.h });
  });
}
