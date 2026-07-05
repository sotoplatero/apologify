export function looksLikeName(value) {
  if (!value) return false;
  return /^[\p{L}][\p{L}''.\-]{0,38}$/u.test(value.trim());
}

export function apologyHeading(toWhom) {
  if (!toWhom) return null;
  const t = toWhom.trim();
  return looksLikeName(t) ? `Dear ${t},` : `To ${t},`;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
