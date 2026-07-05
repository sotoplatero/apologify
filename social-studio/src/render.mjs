import { openSync, readSync, closeSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import puppeteer from "puppeteer";

export const FORMATS = {
  portrait: { w: 1080, h: 1350 },
  square:   { w: 1080, h: 1080 },
  story:    { w: 1080, h: 1920 },
};

/**
 * Screenshot self-contained HTML (returned by the app's POST /api/social-card)
 * to a PNG at exact social dimensions. Waits for network idle so the app's
 * Google-hosted fonts load before capture. The HTML is the REAL rendered design
 * (single source of truth) — the studio only rasterizes it.
 */
export async function renderHtmlToPng(html, format, outPath) {
  const dim = FORMATS[format] || FORMATS.portrait;
  mkdirSync(dirname(outPath), { recursive: true });
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: dim.w, height: dim.h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 45000 });
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: dim.w, height: dim.h } });
    return outPath;
  } finally {
    await browser.close();
  }
}

// Minimal PNG IHDR reader (bytes 16–24 hold width/height, big-endian).
export function pngSize(path) {
  const fd = openSync(path, "r");
  const buf = Buffer.alloc(24);
  readSync(fd, buf, 0, 24, 0);
  closeSync(fd);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
