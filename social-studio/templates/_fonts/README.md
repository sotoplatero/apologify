# Local fonts (optional, for higher fidelity)

Templates use CSS `@font-face` with generic fallbacks, so rendering works
without these files. For pixel-faithful output, drop these woff2 files here
(download once from Google Fonts):

- `fraunces.woff2`   — Fraunces (display serif)
- `lora.woff2`       — Lora (body serif)
- `dancing.woff2`    — Dancing Script (cursive signature)
- `inter.woff2`      — Inter (UI sans)
- `courier.woff2`    — Courier Prime (typewriter)

At render time, `renderCard` (`src/render.mjs`) inlines any woff2 file found
here as a base64 `data:` URI, so it is embedded directly in the HTML handed
to Puppeteer — this is required because relative `_fonts/*.woff2` URLs can
never resolve against Puppeteer's `about:blank` page. These files are
gitignored; if a given file is absent, rendering falls back to system
serif/cursive/monospace via `local()`/generic fallbacks.
