<script lang="ts">
  export let letter: string;

  let copied = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(letter);
      copied = true;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  function downloadLetter() {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apology-letter.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<!-- One example letter: a sheet of paper, with its tools underneath. -->
<figure class="lt">
  <div class="lt-sheet">
    <div class="lt-text">{@html letter}</div>
  </div>

  <figcaption class="lt-bar">
    <span class="lt-tip">Personalize it before you send it.</span>
    <span class="lt-tools">
      <button type="button" class="lt-tool" class:is-done={copied} on:click={copyToClipboard}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {#if copied}
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          {:else}
            <rect x="8.5" y="8.5" width="11" height="11" />
            <path d="M15.5 8.5V4.5h-11v11h4" />
          {/if}
        </svg>
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
      <button type="button" class="lt-tool" on:click={downloadLetter}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
        </svg>
        <span>Download</span>
      </button>
    </span>
  </figcaption>
</figure>

<style>
  .lt {
    --lt-paper: #fffdf8;
    --lt-ink: #241f1a;
    --lt-mute: #6b6157;
    --lt-rule: #e0d8c8;
    --lt-red: #c1272d;
    margin: 0;
  }

  /* The sheet: warm white paper lifted off the page by a soft, offset shadow. */
  .lt-sheet {
    position: relative;
    padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 7vw, 4.5rem);
    background: var(--lt-paper);
    box-shadow:
      0 1px 2px rgba(36, 31, 26, 0.06),
      0 24px 48px -28px rgba(36, 31, 26, 0.28);
    animation: lt-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .lt-text {
    max-width: 62ch;
    margin: 0 auto;
    font-family: "Spectral", Georgia, serif;
    font-size: clamp(1.06rem, 2.2vw, 1.16rem);
    font-weight: 400;
    line-height: 1.8;
    color: var(--lt-ink);
    white-space: pre-wrap;
    text-wrap: pretty;
  }
  .lt-text :global(p) { margin: 0 0 1.15em; }
  .lt-text :global(p:last-child) { margin-bottom: 0; }
  .lt-text :global(strong) { font-weight: 600; }

  /* Tools sit under the sheet, outside the paper. */
  .lt-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 0.1rem 0;
    font-family: "Jost", system-ui, sans-serif;
  }
  .lt-tip { font-size: 0.85rem; color: var(--lt-mute); }
  .lt-tools { display: flex; gap: 1.5rem; }
  .lt-tool {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0;
    font: inherit;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--lt-ink);
    background: none;
    border: 0;
    border-bottom: 1px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .lt-tool:hover { border-bottom-color: var(--lt-ink); }
  .lt-tool:focus-visible { outline: 1px solid var(--lt-ink); outline-offset: 4px; }
  .lt-tool.is-done { color: var(--lt-red); }
  .lt-tool svg {
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: square;
  }

  @keyframes lt-in { from { opacity: 0; transform: translateY(14px); } }

  @media (max-width: 560px) {
    .lt-tip { display: none; }
    .lt-bar { justify-content: flex-end; }
  }
  @media (prefers-reduced-motion: reduce) { .lt-sheet { animation: none; } }
</style>
