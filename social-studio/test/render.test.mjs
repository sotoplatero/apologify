import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderHtmlToPng, pngSize, FORMATS } from "../src/render.mjs";

const HTML = `<!doctype html><html><body style="margin:0">
  <main style="width:100%;height:100vh;background:#fdf6ec"></main>
</body></html>`;

test("FORMATS defines the three social sizes", () => {
  assert.deepEqual(FORMATS.portrait, { w: 1080, h: 1350 });
  assert.deepEqual(FORMATS.square, { w: 1080, h: 1080 });
  assert.deepEqual(FORMATS.story, { w: 1080, h: 1920 });
});

test("renderHtmlToPng screenshots HTML at exact portrait dimensions", async () => {
  const out = join(mkdtempSync(join(tmpdir(), "studio-")), "card.png");
  await renderHtmlToPng(HTML, "portrait", out);
  assert.deepEqual(pngSize(out), { width: FORMATS.portrait.w, height: FORMATS.portrait.h });
});

test("renderHtmlToPng honors the square format", async () => {
  const out = join(mkdtempSync(join(tmpdir(), "studio-")), "sq.png");
  await renderHtmlToPng(HTML, "square", out);
  assert.deepEqual(pngSize(out), { width: FORMATS.square.w, height: FORMATS.square.h });
});
