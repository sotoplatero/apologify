/**
 * Apology page TEMPLATES. Each id maps to a genuinely distinct page design
 * (its own layout, typography and atmosphere — not just a recolor), rendered
 * by a matching component under src/components/templates/.
 *
 * @typedef {Object} Template
 * @property {string} id
 * @property {string} label
 * @property {string} emoji
 * @property {boolean} premium
 * @property {string} bgClass   Representative gradient for the picker swatch
 */

/** @type {Template[]} */
export const THEMES = [
  { id: 'classic',   label: 'Letter',    emoji: '✉️', premium: false, bgClass: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100' },
  { id: 'cute-duck', label: 'Cute',      emoji: '🐤', premium: false, bgClass: 'bg-gradient-to-br from-yellow-200 via-pink-200 to-orange-200' },
  { id: 'formal',    label: 'Statement', emoji: '📄', premium: false, bgClass: 'bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300' },
  { id: 'starry',    label: 'Night',     emoji: '🌙', premium: true,  bgClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900' },
];

/** Metadata + swatch background for the template picker. */
export function listThemes() {
  return THEMES.map(({ id, label, emoji, premium, bgClass }) => ({ id, label, emoji, premium, bgClass }));
}

/** @param {string} id @returns {Template} */
export function resolveTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/** @param {string} id @returns {boolean} */
export function isPremiumTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  return t ? t.premium : false;
}
