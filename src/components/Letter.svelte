<script lang="ts">
  export let letter: string;
  let copied = false;
  let timeoutId: number;

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

<div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
  <div class="card-body relative">
    <div class="absolute bottom-4 right-4 flex items-center gap-2">
      {#if copied}
        <div class="badge badge-success gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Copied!
        </div>
      {/if}
      <button 
        class="btn btn-square {copied ? 'btn-success' : ''}"
        on:click={copyToClipboard}
        title="Copy to clipboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>

    <div class="prose prose-lg max-w-none">
      <p class="whitespace-pre-line">{letter}</p>
    </div>
  </div>
</div> 