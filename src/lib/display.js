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

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Render the limited Markdown the generator produces (**bold**, *italic*,
 * _italic_) into safe HTML paragraphs. HTML is escaped FIRST, so model output
 * can never inject markup — only bold/italic spans are re-introduced. Returns
 * one HTML string per paragraph (blank-line separated); single newlines become
 * <br>.
 * @param {string | null | undefined} message
 * @returns {string[]}
 */
export function apologyParagraphsHtml(message) {
  if (!message) return [];
  return message
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) =>
      escapeHtml(p)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
        .replace(/_([^_\n]+)_/g, "<em>$1</em>")
        .replace(/\n/g, "<br>")
    );
}
