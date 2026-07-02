<script>
  import { actions } from "astro:actions";

  export let slug;
  let busy = false;

  async function unpublish() {
    if (busy) return;
    const sure = confirm(
      "Unpublish this page? The link will stop working and it'll be removed from search. You can publish it again later.",
    );
    if (!sure) return;
    busy = true;
    const { error } = await actions.unpublishApology({ slug });
    busy = false;
    if (error) {
      alert(error.message || "Couldn't unpublish. Please try again.");
      return;
    }
    window.location.reload();
  }
</script>

<button
  type="button"
  class="btn btn-sm btn-ghost gap-1.5 text-error hover:bg-error/10 font-sans"
  on:click={unpublish}
  disabled={busy}
>
  <svg class="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
  {busy ? "Removing…" : "Unpublish"}
</button>
