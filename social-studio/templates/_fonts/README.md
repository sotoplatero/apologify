# Local fonts (optional, for higher fidelity)

Templates use CSS `@font-face` with generic fallbacks, so rendering works
without these files. For pixel-faithful output, drop these woff2 files here
(download once from Google Fonts):

- `fraunces.woff2`   — Fraunces (display serif)
- `lora.woff2`       — Lora (body serif)
- `dancing.woff2`    — Dancing Script (cursive signature)
- `inter.woff2`      — Inter (UI sans)
- `courier.woff2`    — Courier Prime (typewriter)

These are gitignored; rendering falls back to system serif/cursive/monospace
if absent.
