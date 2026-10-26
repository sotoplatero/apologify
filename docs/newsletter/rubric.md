# Apology score rubric (0–5)

Used verbatim by the n8n scoring prompt (`prompts.md` → SCORE). The model proposes; the editor decides.

Judge **the apology text only** — never whether the person is guilty of what they're accused of.

## Components (score each 0, 1 or 2)

| Key | Component | 0 | 1 | 2 | Weight |
|---|---|---|---|---|---|
| `responsibility` | Takes responsibility | Denies / deflects | Vague ("we fell short") | Clear first person: "I/we did X" | ×3 |
| `repair` | Offers repair | None | Generic ("we'll do better") | Concrete, checkable (refunds, donation, policy change, date) | ×2 |
| `names_act` | Names the specific act | Never says what happened | Euphemism ("the incident") | Says exactly what was done | ×2 |
| `regret` | Expresses regret | Absent | Formulaic | Sincere, specific to who was hurt | ×1 |
| `forbearance` | Commits not to repeat | Absent | Promise only | Promise + verifiable step | ×1 |
| `asks_forgiveness` | Asks for forgiveness / says "I'm sorry" plainly | Absent | Implied | Explicit | ×1 |

Max = 20.

## Penalties (−2 each, floor 0)

- `passive_voice` — "mistakes were made", "harm was caused"
- `conditional` — "if anyone was offended", "to those who feel"
- `blame_shift` — blames others, context, "the internet", a misinterpretation
- `late` — issued long after the act, only once it went viral
- `forced` — only after evident legal/commercial pressure (sponsor dropped, lawsuit)
- `lawyered` — legal/PR boilerplate that says nothing

## Score

Score = total ÷ 4, rounded to the nearest half point (0–5). The editor can change it in the review form.

A refusal to apologize ("non-apology") scores 0 automatically and goes in the `worst` slot candidates.

## Verdict

One sentence, ≤ 15 words, concrete, no empty adjectives ("heartfelt", "powerful"). It says *why* the score.

- 5: "Names the failure, refunds everyone, no small print."
- 2.5: "Says sorry twice, never says for what."
- 0: "Three lawyer paragraphs and not one admission."
