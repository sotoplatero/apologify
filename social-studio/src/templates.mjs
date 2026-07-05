import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(HERE, "..", "templates");
const ALL = ["portrait", "square", "story"];

export const DESIGNS = [
  { id: "classic",     label: "Letter",      file: "classic.html",     formats: ALL },
  { id: "typewriter",  label: "Typewriter",  file: "typewriter.html",  formats: ALL },
  { id: "starry",      label: "Night",       file: "starry.html",      formats: ALL },
  { id: "watercolor",  label: "Watercolor",  file: "watercolor.html",  formats: ALL },
  { id: "ransom",      label: "Ransom",      file: "ransom.html",      formats: ALL },
  { id: "sticky-note", label: "Sticky Note", file: "sticky-note.html", formats: ALL },
];

export function listDesigns() { return DESIGNS; }
export function resolveDesign(id) { return DESIGNS.find((d) => d.id === id) || null; }
export function randomDesign(seed) {
  const i = Number.isInteger(seed) ? seed % DESIGNS.length : Math.floor(Math.random() * DESIGNS.length);
  return DESIGNS[i];
}
export function loadTemplateHtml(id) {
  const d = resolveDesign(id);
  if (!d) throw new Error(`Unknown design: ${id}`);
  return readFileSync(join(TEMPLATES_DIR, d.file), "utf8");
}
