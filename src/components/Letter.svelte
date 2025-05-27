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
</script>

<!-- Diseño moderno tipo carta física -->
<div class="letter-container max-w-4xl mx-auto">
  <!-- Header decorativo -->
  <div class="letter-header bg-gradient-to-r from-purple-100 via-purple-50 to-blue-100 rounded-t-2xl p-6 border-b-2 border-purple-200 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div class="text-sm text-gray-700 font-semibold">Apology Letter</div>
      </div>
      <!-- Botón de copiar en el header -->
      <div class="flex items-center">
        <CopyButton text={letter} />
      </div>
    </div>
  </div>

  <!-- Contenido principal de la carta -->
  <div class="letter-body bg-white/90 backdrop-blur-sm shadow-xl rounded-b-2xl border-2 border-gray-200 relative overflow-hidden">
    <!-- Patrón de fondo sutil -->
    <div class="absolute inset-0 opacity-5">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="paper-lines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse">
            <line x1="0" y1="31" x2="100%" y2="31" stroke="#e5e7eb" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paper-lines)"/>
      </svg>
    </div>

    <!-- Contenido de la carta -->
    <div class="relative p-8 md:p-12">
      <!-- Texto de la carta -->
      <div class="letter-content">
        <div class="prose prose-lg max-w-none">
          <div class="letter-text text-gray-800 leading-relaxed text-lg font-light tracking-wide whitespace-pre-wrap">
            {letter}
            <!-- {#each letter.split('\n') as paragraph}
              {#if paragraph.trim()}
                <p class="mb-6 first:mt-0 last:mb-0">{paragraph}</p>
              {:else}
                <div class="mb-4"></div>
              {/if}
            {/each} -->
          </div>
        </div>
      </div>
    </div>

    <!-- Efecto de sombra interna -->
    <div class="absolute inset-0 rounded-b-2xl shadow-inner pointer-events-none"></div>
  </div>

  <!-- Mensaje de copiado -->
  {#if copied}
    <div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      ✓ Letter copied to clipboard!
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