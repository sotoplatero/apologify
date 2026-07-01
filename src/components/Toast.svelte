<script>
  export let message = '';
  export let type = 'success';
  export let show = false;
</script>

{#if show}
  <div
    class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 {type === 'success' ? 'bg-success text-success-content' : 'bg-error text-error-content'}"
    role="alert"
  >
    {message}
  </div>
{/if} 