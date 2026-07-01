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
  class="btn btn-sm btn-ghost text-error"
  on:click={unpublish}
  disabled={busy}
>
  {busy ? "Removing…" : "Unpublish"}
</button>
