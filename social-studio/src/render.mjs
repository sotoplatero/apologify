import { openSync, readSync, closeSync } from "node:fs";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import nodeHtmlToImage from "node-html-to-image";
import { loadTemplateHtml } from "./templates.mjs";
import { apologyParagraphsHtml, escapeHtml } from "./text.mjs";

export const FORMATS = {
  portrait: { w: 1080, h: 1350 },
  square:   { w: 1080, h: 1080 },
  story:    { w: 1080, h: 1920 },
};

export function buildHtml(designId, content, format) {
  const dim = FORMATS[format] || FORMATS.portrait;
  const { title = "", heading = null, paragraphs = [], senderName = "" } = content;
  const paraHtml = paragraphs
    .flatMap((p) => (p.includes("<") ? [p] : apologyParagraphsHtml(p)))
    .map((h) => `<p>${h}</p>`)
    .join("\n");
  const titleHtml = escapeHtml(String(title));
  const headingHtml = heading ? `<p class="heading">${escapeHtml(heading)}</p>` : "";
  const senderHtml = senderName ? `<p class="sender">${escapeHtml(senderName)}</p>` : "";
  return loadTemplateHtml(designId)
    .replaceAll("{{WIDTH}}", `${dim.w}px`)
    .replaceAll("{{HEIGHT}}", `${dim.h}px`)
    .replaceAll("{{TITLE}}", titleHtml)
    .replaceAll("{{HEADING}}", headingHtml)
    .replaceAll("{{PARAGRAPHS}}", paraHtml)
    .replaceAll("{{SENDER}}", senderHtml);
}

export async function renderCard(designId, content, format, outPath) {
  const dim = FORMATS[format] || FORMATS.portrait;
  mkdirSync(dirname(outPath), { recursive: true });
  await nodeHtmlToImage({
    output: outPath,
    html: buildHtml(designId, content, format),
    type: "png",
    selector: ".frame",
    puppeteerArgs: {
      defaultViewport: { width: dim.w, height: dim.h, deviceScaleFactor: 1 },
      args: ["--no-sandbox", "--allow-file-access-from-files"],
    },
  });
  return outPath;
}

// Minimal PNG IHDR reader (bytes 16–24 hold width/height, big-endian).
export function pngSize(path) {
  const fd = openSync(path, "r");
  const buf = Buffer.alloc(24);
  readSync(fd, buf, 0, 24, 0);
  closeSync(fd);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
