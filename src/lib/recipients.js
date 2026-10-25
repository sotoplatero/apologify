import { allRecipients } from './apologyData.js';

// Legacy /examples URLs were built from free-text recipients ("Boyfriend ",
// "gf", "Coworker "…). Map them to canonical recipient ids so old URLs can 301.
const SYNONYMS = {
  bf: 'boyfriend', boyfreind: 'boyfriend', 'my boyfriend': 'boyfriend', 'for my boyfriend': 'boyfriend',
  gf: 'girlfriend', 'girl friend': 'girlfriend', 'my girlfriend': 'girlfriend', pacarku: 'girlfriend',
  bestie: 'friend', bff: 'friend', bestfriend: 'friend', 'best friend': 'friend',
  sister: 'sibling', brother: 'sibling', brothers: 'sibling', 'brother in law': 'sibling',
  grandma: 'grandmother', coworker: 'colleague', 'co-worker': 'colleague',
  customer: 'public', customers: 'public', business: 'public',
  'band teacher': 'teacher', techer: 'teacher',
  'college dean': 'professor', 'my love': 'romantic', crush: 'romantic',
};

const KNOWN = new Set(allRecipients.map((r) => r.value));

/** Canonical recipient id for a raw value, or null if unrecognizable. */
export function normalizeRecipient(raw) {
  const key = String(raw ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (KNOWN.has(key)) return key;
  return SYNONYMS[key] ?? null;
}

export function recipientLabel(value) {
  return allRecipients.find((r) => r.value === value)?.label ?? value;
}
