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
  { id: 'classic',        label: 'Letter',    emoji: '✉️', premium: false, bgClass: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100' },
  { id: 'cute-duck',      label: 'Cute',      emoji: '🐤', premium: false, bgClass: 'bg-gradient-to-br from-yellow-200 via-pink-200 to-orange-200' },
  { id: 'formal',         label: 'Statement', emoji: '📄', premium: false, bgClass: 'bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300' },
  { id: 'keep-calm',      label: 'Keep Calm', emoji: '👑', premium: false, bgClass: 'bg-[#b3122b]' },
  { id: 'swiss',          label: 'Swiss',     emoji: '🔴', premium: false, bgClass: 'bg-gradient-to-br from-white via-gray-100 to-red-500' },
  { id: 'ransom',         label: 'Ransom',    emoji: '✂️', premium: false, bgClass: 'bg-gradient-to-br from-yellow-200 via-neutral-300 to-red-500' },
  { id: 'starry',         label: 'Night',     emoji: '🌙', premium: false, bgClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900' },
  { id: 'constructivist', label: 'Avant',     emoji: '⬛', premium: false, bgClass: 'bg-gradient-to-br from-red-600 via-black to-neutral-200' },
  { id: 'letterpress',    label: 'Letterpress', emoji: '🥊', premium: false, bgClass: 'bg-gradient-to-br from-[#cdb892] to-[#5b4a2f]' },
  // Iconic set (added later; free for now — monetization is a future phase).
  { id: 'handwritten',    label: 'Handwritten',   emoji: '✍️', premium: false, bgClass: 'bg-gradient-to-br from-[#fbf7ec] to-[#eadfc6]' },
  { id: 'typewriter',     label: 'Typewriter',    emoji: '⌨️', premium: false, bgClass: 'bg-gradient-to-br from-[#f5efdf] to-[#d8cba6]' },
  { id: 'minimal',        label: 'Minimal',       emoji: '⚪', premium: false, bgClass: 'bg-gradient-to-br from-white to-[#e9e9ee]' },
  { id: 'sticky-note',    label: 'Sticky Note',   emoji: '🗒️', premium: false, bgClass: 'bg-gradient-to-br from-[#fff7a8] to-[#ffe15c]' },
  { id: 'watercolor',     label: 'Watercolor',    emoji: '🎨', premium: false, bgClass: 'bg-gradient-to-br from-[#f3d9e0] via-[#d9e6d0] to-[#cdd9e8]' },
  { id: 'boarding-pass',  label: 'Boarding Pass', emoji: '✈️', premium: false, bgClass: 'bg-gradient-to-br from-[#eef2f6] to-[#c9d6e2]' },
  { id: 'mixtape',        label: 'Mixtape',       emoji: '📼', premium: false, bgClass: 'bg-gradient-to-br from-[#2b2b2b] to-[#111111]' },
  { id: 'chalkboard',     label: 'Chalkboard',    emoji: '🖍️', premium: false, bgClass: 'bg-gradient-to-br from-[#2f4139] to-[#1e2a24]' },
  { id: 'illuminated',    label: 'Illuminated',   emoji: '📜', premium: false, bgClass: 'bg-gradient-to-br from-[#efe3c4] to-[#c9a24a]' },
  { id: 'telegram',       label: 'Telegram',      emoji: '📟', premium: false, bgClass: 'bg-gradient-to-br from-[#f3ead0] to-[#d8c79a]' },
  { id: 'newspaper',      label: 'Newspaper',     emoji: '📰', premium: false, bgClass: 'bg-gradient-to-br from-[#f4f1ea] to-[#d9d4c7]' },
  { id: 'zine',           label: 'Zine',          emoji: '🖨️', premium: false, bgClass: 'bg-gradient-to-br from-[#ff3d8b] to-[#1f6fff]' },
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
