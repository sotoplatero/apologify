<script lang="ts">
  import CopyButton from './CopyButton.svelte';
  export let letter: string;
  let copied = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(letter);
      copied = true;

      // Limpiar timeout anterior si existe
      if (timeoutId) clearTimeout(timeoutId);

      // Ocultar el mensaje después de 2 segundos
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
</script>

<!-- Card estilo DaisyUI con diseño de carta -->
<div class="letter-container max-w-4xl mx-auto">
  <!-- Card principal -->
  <div class="card bg-base-100 shadow-2xl border border-base-300 overflow-hidden">
    <!-- Header con actions -->
    <div class="card-header bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-6 py-4 border-b border-base-300">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Indicadores decorativos -->
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-primary"></div>
            <div class="w-3 h-3 rounded-full bg-secondary"></div>
            <div class="w-3 h-3 rounded-full bg-accent"></div>
          </div>
          <h3 class="text-sm font-semibold">Your Apology Letter</h3>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            on:click={copyToClipboard}
            class="btn btn-ghost btn-sm gap-2"
            title="Copy to clipboard"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            on:click={downloadLetter}
            class="btn btn-ghost btn-sm gap-2"
            title="Download as text file"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>

    <!-- Card body con la carta -->
    <div class="card-body bg-base-100 relative">
      <!-- Patrón de fondo sutil tipo papel -->
      <div class="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="paper-lines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse">
              <line x1="0" y1="31" x2="100%" y2="31" stroke="currentColor" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#paper-lines)"/>
        </svg>
      </div>

      <!-- Contenido de la carta -->
      <div class="relative">
        <div class="prose prose-lg max-w-none">
          <div class="letter-text whitespace-pre-wrap">
            {letter}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer opcional con tip -->
    <div class="card-footer bg-base-200/50 px-6 py-3 border-t border-base-300">
      <div class="flex items-center gap-2 text-xs opacity-60">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Feel free to edit and personalize this letter before sending</span>
      </div>
    </div>
  </div>

  <!-- Toast de confirmación -->
  {#if copied}
    <div class="toast toast-top toast-end z-50">
      <div class="alert alert-success">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Letter copied to clipboard!</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .letter-container {
    font-family: 'Georgia', 'Times New Roman', serif;
  }

  .letter-text {
    /* text-indent: 2rem; */
    line-height: 1.8;
  }

  .letter-text p:first-child {
    text-indent: 0;
  }

  /* Animaciones */
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-in-from-top-2 {
    from { transform: translateY(-0.5rem); }
    to { transform: translateY(0); }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .slide-in-from-top-2 {
    animation: slide-in-from-top-2 0.3s ease-out;
  }

  .duration-300 {
    animation-duration: 0.3s;
  }

  /* Efecto hover para toda la carta */
  .letter-body {
    transition: all 0.3s ease;
  }

  .letter-container:hover .letter-body {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .letter-text {
      text-indent: 1rem;
      font-size: 1rem;
      line-height: 1.7;
    }
  }
</style> 