/**
 * @typedef {Object} Theme
 * @property {string} id
 * @property {string} label
 * @property {string} emoji
 * @property {boolean} premium
 * @property {string} bgClass      Tailwind classes for the full-screen background
 * @property {string} cardClass    Tailwind classes for the letter card
 * @property {string} accentClass  Tailwind classes for heading + signature
 * @property {string} bodyClass    Tailwind classes for the body text
 * @property {string} font         Tailwind font-family utility
 */

/** @type {Theme[]} */
export const THEMES = [
  {
    id: 'classic', label: 'Classic', emoji: '💌', premium: false,
    bgClass: 'bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100',
    cardClass: 'bg-white/80 backdrop-blur border border-white/70',
    accentClass: 'text-purple-800', bodyClass: 'text-gray-700', font: 'font-display',
  },
  {
    id: 'cute-duck', label: 'Cute', emoji: '🐤', premium: false,
    bgClass: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100',
    cardClass: 'bg-white/85 backdrop-blur border border-amber-100',
    accentClass: 'text-amber-700', bodyClass: 'text-gray-700', font: 'font-sans',
  },
  {
    id: 'formal', label: 'Formal', emoji: '🏛️', premium: false,
    bgClass: 'bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100',
    cardClass: 'bg-white/90 border border-slate-200',
    accentClass: 'text-slate-800', bodyClass: 'text-slate-700', font: 'font-display',
  },
  {
    id: 'hearts', label: 'Hearts', emoji: '💕', premium: true,
    bgClass: 'bg-gradient-to-br from-rose-200 via-pink-100 to-red-100',
    cardClass: 'bg-white/80 backdrop-blur border border-rose-100',
    accentClass: 'text-rose-700', bodyClass: 'text-gray-700', font: 'font-display',
  },
  {
    id: 'starry', label: 'Starry', emoji: '🌙', premium: true,
    bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950',
    cardClass: 'bg-white/10 backdrop-blur border border-white/20',
    accentClass: 'text-indigo-100', bodyClass: 'text-indigo-50/90', font: 'font-display',
  },
  {
    id: 'petals', label: 'Petals', emoji: '🌸', premium: true,
    bgClass: 'bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100',
    cardClass: 'bg-white/80 backdrop-blur border border-fuchsia-100',
    accentClass: 'text-fuchsia-700', bodyClass: 'text-gray-700', font: 'font-sans',
  },
];

/** Metadata + background for the theme picker swatches. */
export function listThemes() {
  return THEMES.map(({ id, label, emoji, premium, bgClass }) => ({ id, label, emoji, premium, bgClass }));
}

/** @param {string} id @returns {Theme} */
export function resolveTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/** @param {string} id @returns {boolean} */
export function isPremiumTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  return t ? t.premium : false;
}
