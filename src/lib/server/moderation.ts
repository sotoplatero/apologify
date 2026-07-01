/**
 * Lightweight, deterministic content moderation for apology pages.
 *
 * These pages are AI-authored and publicly indexable, so we gate the free-text
 * a user contributes (what happened + who it's from/for) and the generated
 * message before anything is saved or published. This is intentionally NOT an
 * LLM call: it must not depend on any API account, must be instant, and must
 * never block a legitimate heartfelt apology. It only catches a narrow set of
 * clearly-disallowed content:
 *
 *   - sexual content involving minors (zero tolerance)
 *   - explicit hate slurs
 *   - contact info / doxxing (emails, phone numbers) in public content
 *   - link spam
 *
 * Emotional topics (infidelity, addiction, conflict, grief) are expected in
 * real apologies and are NOT flagged.
 */

export interface ModerationResult {
  ok: boolean;
  /** User-facing reason, safe to show. Present only when ok === false. */
  reason?: string;
}

const OK: ModerationResult = { ok: true };

// Explicit hate slurs (word-boundary matched). Deliberately short and
// unambiguous — these have no place on a public apology page.
const SLURS = [
  'nigger', 'nigga', 'faggot', 'fag', 'kike', 'chink', 'spic', 'wetback',
  'coon', 'tranny', 'retard', 'retarded', 'gook', 'paki',
];

// "Minor" terms that, combined with sexual terms, indicate CSAM. Either list
// alone is fine (people apologize about children and about sex); the dangerous
// signal is the two together in the same text.
const MINOR_TERMS = [
  'child', 'children', 'kid', 'kids', 'minor', 'minors', 'underage',
  'preteen', 'pre-teen', 'toddler', 'infant', 'boy', 'girl', 'schoolgirl',
  'schoolboy', '\\d{1,2}\\s?yo', '\\d{1,2}\\s?y/o',
];
const SEXUAL_TERMS = [
  'sex', 'sexual', 'porn', 'nude', 'naked', 'molest', 'rape', 'fondle',
  'genitals', 'penis', 'vagina', 'cum', 'blowjob', 'incest',
];

const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
// Phone: 7+ digits allowing spaces, dashes, dots, parens, optional country code.
const PHONE_RE = /(?:\+?\d[\s.-]?){7,}/;
const URL_RE = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|co|me|info|xyz|dev|app)\b/i;

function wordListRegex(words: string[]): RegExp {
  return new RegExp(`\\b(?:${words.join('|')})\\b`, 'i');
}

const SLUR_RE = wordListRegex(SLURS);
const MINOR_RE = new RegExp(`\\b(?:${MINOR_TERMS.join('|')})\\b`, 'i');
const SEXUAL_RE = wordListRegex(SEXUAL_TERMS);

/**
 * Moderate a bundle of user/generated text. Pass everything that will end up on
 * the public page (context, names, generated message, title).
 */
export function moderateApologyContent(parts: {
  context?: string;
  message?: string;
  title?: string;
  senderName?: string;
  recipient?: string;
}): ModerationResult {
  const publicText = [parts.context, parts.message, parts.title, parts.senderName, parts.recipient]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

  if (!publicText.trim()) return OK;

  if (SLUR_RE.test(publicText)) {
    return { ok: false, reason: 'This text contains a slur we can’t publish. Please reword it.' };
  }

  if (MINOR_RE.test(publicText) && SEXUAL_RE.test(publicText)) {
    return { ok: false, reason: 'We can’t create this page.' };
  }

  // Contact info only matters for the free-text the user typed, not the
  // AI-generated prose (which never invents real contact details). Names are
  // short and unlikely to contain PII; check context specifically.
  if (parts.context) {
    if (EMAIL_RE.test(parts.context)) {
      return { ok: false, reason: 'Please remove email addresses — this page is public.' };
    }
    if (PHONE_RE.test(parts.context)) {
      return { ok: false, reason: 'Please remove phone numbers — this page is public.' };
    }
  }

  // Link spam in any user-typed field.
  if ([parts.context, parts.senderName, parts.recipient].filter(Boolean).some((t) => URL_RE.test(t as string))) {
    return { ok: false, reason: 'Links aren’t allowed. Please remove them.' };
  }

  return OK;
}
