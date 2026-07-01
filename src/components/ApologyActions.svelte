<script lang="ts">
  import { actions } from "astro:actions";
  import { onMount } from "svelte";

  export let slug: string;
  // Legacy prop, still passed by templates; absorbed so there's no unknown-prop warning.
  export let acceptedAt: string | null = null;
  export let preview = false;
  export let acceptLabel = "Like this 💛";
  // Template-provided styling so the buttons match each design.
  export let primaryClass = "";
  export let secondaryClass = "";
  export let mutedClass = "";

  // The recipient's response is a lightweight "like" — a heart tap. The count is
  // the total likes on the page; localStorage stops the same browser re-liking.
  let likeCount = 0;
  let liked = false;
  let busy = false;
  let copied = false;

  const storageKey = `apologify_liked_${slug}`;

  onMount(async () => {
    if (preview) return;
    try { liked = localStorage.getItem(storageKey) === "1"; } catch (_) {}
    try {
      const { data } = await actions.getApologyLikes({ slug });
      if (data) likeCount = data.likes;
    } catch (_) {}
  });

  async function like() {
    if (busy || liked) return;
    busy = true;
    liked = true; likeCount += 1; // optimistic
    try { localStorage.setItem(storageKey, "1"); } catch (_) {}
    try {
      const { data } = await actions.likeApology({ slug });
      if (data) likeCount = data.likes;
    } catch (_) { /* keep optimistic count */ }
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
  <p class={mutedClass}>Your recipient can like this 💛</p>
{:else if liked}
  <div class="flex flex-wrap items-center justify-center gap-3">
    <span class={primaryClass + " pointer-events-none select-none"}>{`💛 Liked${likeCount > 0 ? ` · ${likeCount}` : ""}`}</span>
    <button on:click={share} class={secondaryClass}>{copied ? "Link copied!" : "Share"}</button>
  </div>
{:else}
  <div class="flex flex-wrap items-center justify-center gap-3">
    <button on:click={like} disabled={busy} class={primaryClass}>
      {`${acceptLabel}${likeCount > 0 ? ` · ${likeCount}` : ""}`}
    </button>
    <button on:click={share} class={secondaryClass}>{copied ? "Link copied!" : "Share"}</button>
  </div>
{/if}
