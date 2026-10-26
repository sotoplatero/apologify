/**
 * Apology page TEMPLATES. Each id maps to a genuinely distinct page design
 * (its own layout, typography and atmosphere — not just a recolor), rendered
 * by a matching component registered in src/components/templates/registry.ts.
 *
 * Retired designs fall in two groups:
 * - still used by saved pages: kept in THEMES with `retired: true` so those
 *   pages keep their look, but hidden from every picker and gallery;
 * - unused: deleted, with an alias in RETIRED_ALIASES so an old id (a stale
 *   link, a Social Studio call) still renders the closest live design.
 *
 * @typedef {Object} Template
 * @property {string} id
 * @property {string} label
 * @property {string} emoji
 * @property {boolean} premium
 * @property {string} bgClass   Representative swatch for the picker
 * @property {boolean} [retired]
 */

/** @type {Template[]} */
export const THEMES = [
  { id: 'classic',        label: 'Letter',        emoji: '✉️', premium: false, bgClass: 'bg-[#f6efe2]' },
  { id: 'editorial',      label: 'Editorial',     emoji: '📰', premium: false, bgClass: 'bg-[#faf7f1]' },
  { id: 'handwritten',    label: 'Handwritten',   emoji: '✍️', premium: false, bgClass: 'bg-gradient-to-br from-[#fbf7ec] to-[#eadfc6]' },
  { id: 'velvet',         label: 'Velvet',        emoji: '🍷', premium: false, bgClass: 'bg-[#4a0f1c]' },
  { id: 'starry',         label: 'Night',         emoji: '🌙', premium: false, bgClass: 'bg-[#0f1424]' },
  { id: 'minimal',        label: 'Minimal',       emoji: '⚪', premium: false, bgClass: 'bg-white' },
  { id: 'postcard',       label: 'Postcard',      emoji: '📮', premium: false, bgClass: 'bg-[#d9e3dc]' },
  { id: 'watercolor',     label: 'Watercolor',    emoji: '🎨', premium: false, bgClass: 'bg-gradient-to-br from-[#f3d9e0] via-[#d9e6d0] to-[#cdd9e8]' },
  { id: 'formal',         label: 'Statement',     emoji: '📄', premium: false, bgClass: 'bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300' },
  { id: 'newspaper',      label: 'Newspaper',     emoji: '📰', premium: false, bgClass: 'bg-gradient-to-br from-[#f4f1ea] to-[#d9d4c7]' },
  { id: 'swiss',          label: 'Swiss',         emoji: '🔴', premium: false, bgClass: 'bg-gradient-to-br from-white via-gray-100 to-red-500' },
  { id: 'cute-duck',      label: 'Cute',          emoji: '🐤', premium: false, bgClass: 'bg-gradient-to-br from-yellow-200 via-pink-200 to-orange-200' },
  { id: 'boarding-pass',  label: 'Boarding Pass', emoji: '✈️', premium: false, bgClass: 'bg-gradient-to-br from-[#eef2f6] to-[#c9d6e2]' },
  // Retired, still rendering for pages saved with them.
  { id: 'keep-calm',      label: 'Keep Calm',     emoji: '👑', premium: false, bgClass: 'bg-[#b3122b]', retired: true },
  { id: 'zine',           label: 'Zine',          emoji: '🖨️', premium: false, bgClass: 'bg-gradient-to-br from-[#ff3d8b] to-[#1f6fff]', retired: true },
];

/** Deleted designs → the live design that replaces them. */
export const RETIRED_ALIASES = {
  ransom: 'swiss',
  constructivist: 'swiss',
  letterpress: 'newspaper',
  typewriter: 'handwritten',
  telegram: 'handwritten',
  'sticky-note': 'handwritten',
  mixtape: 'cute-duck',
  chalkboard: 'starry',
  illuminated: 'classic',
};

/** The id that actually renders for `id`: itself, its alias, or the Letter design. */
export function canonicalThemeId(id) {
  if (THEMES.some((t) => t.id === id)) return id;
  return RETIRED_ALIASES[id] || THEMES[0].id;
}

/** Metadata + swatch background for the template picker (live designs only). */
export function listThemes() {
  return THEMES.filter((t) => !t.retired).map(({ id, label, emoji, premium, bgClass }) => ({ id, label, emoji, premium, bgClass }));
}

/** @param {string} id @returns {Template} */
export function resolveTheme(id) {
  const canonical = canonicalThemeId(id);
  return THEMES.find((t) => t.id === canonical) || THEMES[0];
}

/** @param {string} id @returns {boolean} */
export function isPremiumTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  return t ? t.premium : false;
}
