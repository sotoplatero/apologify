<script lang="ts">
  import { actions } from "astro:actions";

  export let slug: string;
  export let acceptedAt: string | null = null;
  export let preview = false;
  export let acceptLabel = "Accept this apology";
  // Template-provided styling so the buttons match each design.
  export let primaryClass = "";
  export let secondaryClass = "";
  export let mutedClass = "";

  let accepted = !!acceptedAt;
  let busy = false;
  let copied = false;

  async function accept() {
    if (busy || accepted) return;
    busy = true;
    try { await actions.acceptApology({ slug }); accepted = true; }
    catch (_) { accepted = true; } // optimistic — acceptance is low-stakes
    finally { busy = false; }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    const data = { title: "An apology for you", text: "I wrote you something 💛", url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      copied = true; setTimeout(() => (copied = false), 2000);
    } catch (_) {}
  }
</script>

{#if preview}
  <p class={mutedClass}>Your recipient will be able to accept &amp; share here 💛</p>
{:else if accepted}
  <div class="flex flex-col items-center gap-3">
    <p class={primaryClass + " pointer-events-none select-none"}>💛 Apology accepted</p>
    <button on:click={share} class={secondaryClass}>{copied ? "Link copied!" : "Share"}</button>
  </div>
{:else}
  <div class="flex flex-wrap items-center justify-center gap-3">
    <button on:click={accept} disabled={busy} class={primaryClass}>
      {busy ? "…" : acceptLabel}
    </button>
    <button on:click={share} class={secondaryClass}>{copied ? "Link copied!" : "Share"}</button>
  </div>
{/if}
