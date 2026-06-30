<script lang="ts">
  import { actions } from "astro:actions";
  export let slug: string;
  export let theme = "";
  let loading = false;
  let error = "";

  async function publish() {
    loading = true; error = "";
    const { data, error: actionError } = await actions.publishApologyPage({ slug, theme: theme || undefined });
    if (actionError) { error = actionError.message; loading = false; }
    else if (data?.published) window.location.href = `/sorry/${slug}`;
  }
</script>

<button
  on:click={publish}
  disabled={loading}
  class="w-full px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
>
  {loading ? "Publishing…" : "Publish now"}
</button>
{#if error}
  <p class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</p>
{/if}
