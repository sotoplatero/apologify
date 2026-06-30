/**
 * Shared presentation helpers for apology pages, used by both the live page
 * (server) and the generator preview (client) so they render identically.
 */

/**
 * Heuristic: does this "to whom" value read like a name (so "Dear X," fits)?
 * A single token starting with a letter (e.g. "Mia", "Acme") qualifies;
 * phrases like "my girlfriend" or "our customers" do not.
 * @param {string} value
 * @returns {boolean}
 */
export function looksLikeName(value) {
  if (!value) return false;
  return /^[\p{L}][\p{L}'’.\-]{0,38}$/u.test(value.trim());
}

/**
 * The page heading: "Dear {name}," when the addressee looks like a name,
 * otherwise null (the page shows the message without a greeting).
 * @param {string | null | undefined} toWhom
 * @returns {string | null}
 */
export function apologyHeading(toWhom) {
  return toWhom && looksLikeName(toWhom) ? `Dear ${toWhom.trim()},` : null;
}
