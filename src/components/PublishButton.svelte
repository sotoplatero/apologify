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
    else if (data?.published) window.location.href = "/dashboard";
  }
</script>

<button
  on:click={publish}
  disabled={loading}
  class="btn btn-primary btn-lg w-full"
>
  {loading ? "Publishing…" : "Publish now"}
</button>
{#if error}
  <p class="mt-4 p-3 bg-error/10 border border-error/25 rounded-xl text-error text-sm">{error}</p>
{/if}
