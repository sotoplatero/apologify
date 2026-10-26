# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Apologify makers**: someone who owes a person an apology and wants it written well, turned into a page and sent.
- **Apology News readers**, two equal audiences:
  - A media-curious visitor who arrives from a viral apology. They read our score and verdict and decide whether to subscribe to the Tuesday email.
  - A returning subscriber who opens each issue to read it and give their own 0–5 score. Voting requires signing in.

## Product Purpose
Apologify turns a sincere, specific apology into a shareable web page with a recipient flow: open the envelope, like it, then "I forgive you" or "I need some time".

Apology News is its weekly newsletter. It covers the week's public apologies (brands, celebrities, athletes, politicians) and scores each from 0 to 5 on what it admits, names, repairs and promises. It feeds the core product with traffic and an email list, and builds a reputation as the place that knows what a good apology is.

## Positioning
Apology News judges the apology, never the person, with one rubric applied the same way every week. The rubric is the same rule the original study of 845 real apologies (`/research/why-people-apologize`) found. Readers can score each case themselves, so the newsletter publishes our score next to theirs.

## Operating Context
- Issues are produced by the n8n workflow "Apology News: Draft". It discovers cases, grades them, emails an editor review form and opens a GitHub PR, and merging the PR publishes the issue.
- The email goes out on Tuesdays through Resend.
- Every issue has these parts:
  - an apology of the week (best) and a non-apology of the week (worst);
  - 3–6 briefs;
  - per case: score, verdict, quote, news photo (hotlinked og:image with credit) and sources;
  - an AI-generated cover image.

## Capabilities and Constraints
- Astro + Svelte islands, Tailwind/DaisyUI, deployed on Vercel.
- Issue data are JSON validated with Zod (`src/lib/news.ts`).
- Scores are 0–5 in half points, shown quietly as "3.5/5" beside the story. The score supports the reading; it is never the hero of the layout (the user, 2026-10-25: too much prominence on the score).
- Reader voting stores one vote per user per case in `news_votes`.
- Signup is double opt-in through Resend.
- News photos are third-party, hotlinked and may fail to load, so the layout must survive missing images.
- Cover images come from gpt-image-2.5-flare, 1536×1024 webp.

## Brand Commitments
- The name "Apology News" is owned by Apologify.
- The user chose (2026-10-25) to give Apology News its own visual identity, separate from the main Apologify "ink on paper" theme, still signed as made by Apologify. That identity must be **modern, elite, airy and glamorous** (the user's words: "moderno y elitista, con aire y glamour"). Later the same day the user asked for a middle point between News and the app: News keeps its magazine structure (airy layout, hairlines, own masthead) but uses the app's warm paper, ink, postmark red (sparingly) and fonts (Fraunces at a light weight + Inter), with the 💌 logo in the masthead, so it reads as part of Apologify. On 2026-10-26 the user found the app still far from the newsletter and "too AI", so the app chrome (header, footer, home, builder, designs, letter lists, closing CTA) was redesigned into the same language; the apology templates are the product and keep their own looks. Later that night (2026-10-26) the user asked to switch the type pair (now Spectral + Jost across News and the app), redesign /sorry-card, and curate the templates toward modern, elegant and attractive: 9 unused designs were removed (Ransom, Avant, Letterpress, Typewriter, Telegram, Sticky Note, Mixtape, Chalkboard, Illuminated), Keep Calm and Zine were retired from the pickers but still render for saved pages, Letter / Night / Minimal were redesigned and Editorial, Velvet and Postcard were added (13 live designs).
- Main product voice: warm, sincere, specific.
- Newsletter voice: sharp, fair, a little dry. Short verdicts.

## Evidence on Hand
- 9 issues (2026-w36 → w44) with covers in `public/news/`.
- The study data in `src/data/apology-study.json`.
- No subscriber counts, testimonials or press yet. Do not invent them.

## Product Principles
1. Judge the words, not the person.
2. The score is the hook; the verdict is the reason.
3. Every claim links to the source.
4. Readers get a voice (their score) next to ours.
5. Always route back to "write your own apology" without hard-selling.
