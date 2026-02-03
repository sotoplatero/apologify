<script lang="ts">
  import { onMount } from 'svelte';
  export let letter: string;

  let copied = false;
  let timeoutId: ReturnType<typeof setTimeout>;
  let letterRef: HTMLDivElement;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(letter);
      copied = true;

      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  function downloadLetter() {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apology-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Animación de entrada cuando se monta el componente
  onMount(() => {
    if (letterRef) {
      letterRef.style.opacity = '0';
      letterRef.style.transform = 'translateY(20px)';

      requestAnimationFrame(() => {
        letterRef.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        letterRef.style.opacity = '1';
        letterRef.style.transform = 'translateY(0)';
      });
    }
  });
</script>

<!-- Letter Card con diseño Editorial/Refined -->
<div class="letter-wrapper">
  <div class="letter-card" bind:this={letterRef}>

    <!-- Decorative Corner Elements -->
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    <div class="corner-decoration bottom-left"></div>
    <div class="corner-decoration bottom-right"></div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button
        on:click={copyToClipboard}
        class="action-button"
        class:copied={copied}
        title="Copy to clipboard"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span class="button-text">{copied ? 'Copied!' : 'Copy'}</span>
      </button>

      <button
        on:click={downloadLetter}
        class="action-button download"
        title="Download letter"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span class="button-text hidden sm:inline">Download</span>
      </button>
    </div>

    <!-- Letter Content Area -->
    <div class="letter-content">
      <!-- Paper Texture Overlay -->
      <div class="paper-texture"></div>

      <!-- Decorative Header Line -->
      <div class="header-decoration">
        <div class="center-ornament">
          <svg class="ornament" viewBox="0 0 100 20" fill="none">
            <path d="M0 10h35" stroke="currentColor" stroke-width="0.5"/>
            <circle cx="50" cy="10" r="3" fill="currentColor"/>
            <path d="M65 10h35" stroke="currentColor" stroke-width="0.5"/>
          </svg>
        </div>
      </div>

      <!-- Letter Text -->
      <div class="letter-text">
        {@html letter}
      </div>

      <!-- Decorative Footer Line -->
      <div class="footer-decoration">
        <div class="center-ornament">
          <svg class="ornament" viewBox="0 0 100 20" fill="none">
            <path d="M0 10h40" stroke="currentColor" stroke-width="0.5"/>
            <circle cx="50" cy="10" r="2" fill="currentColor"/>
            <circle cx="58" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="65" cy="10" r="1" fill="currentColor"/>
            <path d="M70 10h30" stroke="currentColor" stroke-width="0.5"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Footer Tip -->
    <div class="letter-footer">
      <svg class="footer-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <span>Personalize this letter to make it truly yours</span>
    </div>
  </div>
</div>

<style>
  /* IMPORTAMOS FUENTES ELEGANTES */
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;500&display=swap');

  /* VARIABLES DE COLOR - PALETA SOFISTICADA */
  :global(.letter-wrapper) {
    --letter-cream: #FAF8F5;
    --letter-white: #FFFFFF;
    --letter-warm-gray: #8B8680;
    --letter-dark: #2C2825;
    --letter-accent: #C8796B; /* Terracotta cálido */
    --letter-accent-light: #E8C4B9;
    --letter-shadow: rgba(44, 40, 37, 0.08);
    --letter-border: rgba(44, 40, 37, 0.1);
  }

  /* CONTENEDOR PRINCIPAL */
  .letter-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  /* TARJETA PRINCIPAL */
  .letter-card {
    position: relative;
    background: var(--letter-white);
    border-radius: 4px;
    box-shadow:
      0 1px 3px var(--letter-shadow),
      0 4px 12px var(--letter-shadow),
      0 0 0 1px var(--letter-border);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .letter-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 4px 6px var(--letter-shadow),
      0 12px 28px var(--letter-shadow),
      0 0 0 1px var(--letter-border);
  }

  /* DECORACIONES DE ESQUINA */
  .corner-decoration {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--letter-accent);
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }

  .corner-decoration:hover {
    opacity: 1;
  }

  .corner-decoration.top-left {
    top: 16px;
    left: 16px;
    border-top: 2px solid;
    border-left: 2px solid;
  }

  .corner-decoration.top-right {
    top: 16px;
    right: 16px;
    border-top: 2px solid;
    border-right: 2px solid;
  }

  .corner-decoration.bottom-left {
    bottom: 16px;
    left: 16px;
    border-bottom: 2px solid;
    border-left: 2px solid;
  }

  .corner-decoration.bottom-right {
    bottom: 16px;
    right: 16px;
    border-bottom: 2px solid;
    border-right: 2px solid;
  }

  /* ACTION BAR */
  .action-bar {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--letter-border);
    background: linear-gradient(
      to bottom,
      var(--letter-white) 0%,
      var(--letter-cream) 100%
    );
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--letter-warm-gray);
    background: var(--letter-white);
    border: 1px solid var(--letter-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button:hover {
    color: var(--letter-dark);
    border-color: var(--letter-accent);
    background: var(--letter-cream);
    transform: translateY(-1px);
  }

  .action-button:active {
    transform: translateY(0);
  }

  .action-button.copied {
    color: var(--letter-accent);
    background: var(--letter-accent-light);
    border-color: var(--letter-accent);
  }

  .action-button .icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* LETTER CONTENT */
  .letter-content {
    position: relative;
    padding: 3rem 3.5rem 2.5rem;
    background: var(--letter-cream);
    min-height: 400px;
  }

  /* TEXTURA DE PAPEL */
  .paper-texture {
    position: absolute;
    inset: 0;
    opacity: 0.4;
    pointer-events: none;
    background-image:
      repeating-linear-gradient(
        to right,
        transparent,
        transparent 2px,
        rgba(44, 40, 37, 0.02) 2px,
        rgba(44, 40, 37, 0.02) 4px
      );
  }

  /* DECORACIONES DE ENCABEZADO Y PIE */
  .header-decoration,
  .footer-decoration {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    color: var(--letter-accent);
    opacity: 0.5;
  }

  .footer-decoration {
    padding-top: 2rem;
  }

  .center-ornament .ornament {
    width: 120px;
    height: 24px;
  }

  /* TEXTO DE LA CARTA */
  .letter-text {
    position: relative;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.1875rem;
    line-height: 1.85;
    color: var(--letter-dark);
    white-space: pre-wrap;
  }

  /* Estilizar párrafos dentro de la carta */
  .letter-text :global(p) {
    margin-bottom: 1.25rem;
    text-indent: 2rem;
  }

  .letter-text :global(p:first-of-type) {
    text-indent: 0;
  }

  .letter-text :global(p:first-of-type)::first-letter {
    font-size: 3.5em;
    font-weight: 500;
    float: left;
    line-height: 0.8;
    padding-right: 0.1em;
    margin-top: 0.05em;
    color: var(--letter-accent);
  }

  /* FOOTER TIP */
  .letter-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 1.5rem;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 0.75rem;
    color: var(--letter-warm-gray);
    background: var(--letter-cream);
    border-top: 1px solid var(--letter-border);
  }

  .footer-icon {
    width: 1rem;
    height: 1rem;
    opacity: 0.7;
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .letter-wrapper {
      padding: 1rem 0.5rem;
    }

    .letter-content {
      padding: 2rem 1.5rem 1.5rem;
    }

    .action-bar {
      padding: 1rem;
    }

    .button-text {
      display: none;
    }

    .corner-decoration {
      width: 16px;
      height: 16px;
    }

    .letter-text {
      font-size: 1.0625rem;
      line-height: 1.75;
    }

    .letter-text :global(p) {
      text-indent: 1.5rem;
    }

    .letter-text :global(p:first-of-type)::first-letter {
      font-size: 2.8em;
    }
  }

  /* ANIMACIONES SUAVES */
  @keyframes pulse {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }

  .corner-decoration {
    animation: pulse 3s ease-in-out infinite;
  }

  .corner-decoration.top-left,
  .corner-decoration.bottom-right {
    animation-delay: 0s;
  }

  .corner-decoration.top-right,
  .corner-decoration.bottom-left {
    animation-delay: 1.5s;
  }
</style>
