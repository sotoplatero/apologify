/**
 * @typedef {Object} Theme
 * @property {string} id @property {string} label @property {string} emoji
 * @property {boolean} premium @property {string} bgClass @property {string} accentClass @property {string} font
 */

/** @type {Theme[]} */
export const THEMES = [
  { id: 'classic',   label: 'Classic',          emoji: '💌', premium: false, bgClass: 'bg-gradient-to-br from-purple-100 via-white to-pink-100',      accentClass: 'text-purple-700',  font: 'font-serif' },
  { id: 'cute-duck', label: 'Cute Duck',        emoji: '🐤', premium: false, bgClass: 'bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100',  accentClass: 'text-amber-700',   font: 'font-sans' },
  { id: 'formal',    label: 'Formal Statement', emoji: '🏛️', premium: false, bgClass: 'bg-gradient-to-br from-slate-100 via-white to-gray-100',       accentClass: 'text-slate-800',   font: 'font-serif' },
  { id: 'hearts',    label: 'Floating Hearts',  emoji: '💕', premium: true,  bgClass: 'bg-gradient-to-br from-rose-200 via-pink-100 to-red-100',       accentClass: 'text-rose-700',    font: 'font-serif' },
  { id: 'starry',    label: 'Starry Night',     emoji: '🌙', premium: true,  bgClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900', accentClass: 'text-indigo-200',  font: 'font-serif' },
  { id: 'petals',    label: 'Falling Petals',   emoji: '🌸', premium: true,  bgClass: 'bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100',    accentClass: 'text-fuchsia-700', font: 'font-sans' },
];

export function listThemes() {
  return THEMES.map(({ id, label, emoji, premium }) => ({ id, label, emoji, premium }));
}
/** @param {string} id @returns {Theme} */
export function resolveTheme(id) { return THEMES.find((t) => t.id === id) || THEMES[0]; }
/** @param {string} id @returns {boolean} */
export function isPremiumTheme(id) { const t = THEMES.find((x) => x.id === id); return t ? t.premium : false; }
