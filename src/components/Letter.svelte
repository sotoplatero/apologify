<script lang="ts">
  import CopyButton from './CopyButton.svelte';
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
      <CopyButton text={letter} />
    </div>

    <div class="prose sm:prose-lg max-w-none">
      <p class="whitespace-pre-line">{letter}</p>
    </div>
  </div>
</div> 