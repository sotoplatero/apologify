import slugify from 'slugify';

/** @param {number} length @returns {string} */
export function randomSuffix(length = 6) {
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** @param {{recipientName?:string, recipient:string, title:string}} parts @returns {string} */
export function buildApologySlug(parts) {
  const lead = parts.recipientName && parts.recipientName.trim() ? parts.recipientName : parts.recipient;
  const base = slugify(`${lead} ${parts.title}`, { lower: true, strict: true }).slice(0, 60).replace(/-+$/, '');
  return `${base}-${randomSuffix(6)}`;
}

/** @param {string} value @returns {boolean} */
export function isLikelySlug(value) {
  return typeof value === 'string' && /^[a-z0-9-]{3,90}$/.test(value);
}
