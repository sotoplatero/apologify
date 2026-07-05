import { openSync, readSync, closeSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import nodeHtmlToImage from "node-html-to-image";
import { loadTemplateHtml } from "./templates.mjs";
import { apologyParagraphsHtml, escapeHtml } from "./text.mjs";

export const FORMATS = {
  portrait: { w: 1080, h: 1350 },
  square:   { w: 1080, h: 1080 },
  story:    { w: 1080, h: 1920 },
};

const FONTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "templates", "_fonts");

// Rewrite url("_fonts/<name>.<ext>") -> data URI when the file exists locally;
// leave untouched (harmless) when absent so local()/fallback still apply.
// Supports woff2/woff/ttf/otf so bundled fonts render offline via setContent.
const FONT_MIME = { woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf", otf: "font/otf" };
export function inlineFonts(html, fontsDir = FONTS_DIR) {
  return html.replace(/url\((["']?)_fonts\/([^"')]+\.(woff2|woff|ttf|otf))\1\)/g, (m, _q, name, ext) => {
    const p = join(fontsDir, name);
    if (!existsSync(p)) return m;
    const b64 = readFileSync(p).toString("base64");
    return `url("data:${FONT_MIME[ext]};base64,${b64}")`;
  });
}

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
  const built = buildHtml(designId, content, format);
  await nodeHtmlToImage({
    output: outPath,
    html: inlineFonts(built),
    type: "png",
    selector: ".frame",
    puppeteerArgs: {
      defaultViewport: { width: dim.w, height: dim.h, deviceScaleFactor: 1 },
      args: ["--no-sandbox"],
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
