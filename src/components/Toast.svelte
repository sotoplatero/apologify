<script>
  export let message = '';
  export let type = 'success';
  export let show = false;
</script>

{#if show}
  <div
    class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 {type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white"
    role="alert"
  >
    {message}
  </div>
{/if} 