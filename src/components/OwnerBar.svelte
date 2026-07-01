<script lang="ts">
  // Owner-only bar shown on top of a live apology page: hands the user their
  // shareable link (copy), and quick access to change the design / dashboard.
  export let slug: string;
  export let justPublished = false;

  let copied = false;
  let url = `/sorry/${slug}`;
  if (typeof window !== "undefined") url = `${window.location.origin}/sorry/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (_) {
      // Fallback: select the field so the user can copy manually.
      const el = document.getElementById("owner-url") as HTMLInputElement | null;
      el?.select();
    }
  }
</script>

<div class="fixed top-0 inset-x-0 z-[60] bg-neutral text-neutral-content font-sans shadow-lg">
  <div class="max-w-4xl mx-auto px-3 py-2 flex items-center gap-2 sm:gap-3">
    <span class="shrink-0 text-sm font-medium hidden sm:inline">
      {justPublished ? "🎉 Your page is live" : "Your page"}
    </span>
    <input
      id="owner-url"
      type="text"
      readonly
      value={url}
      class="flex-1 min-w-0 bg-neutral-content/10 rounded px-2 py-1 text-xs text-neutral-content/90 outline-none"
      on:focus={(e) => (e.currentTarget as HTMLInputElement).select()}
    />
    <button type="button" on:click={copy} class="btn btn-xs btn-primary shrink-0">
      {copied ? "Copied!" : "Copy link"}
    </button>
    <a href={`/customize?slug=${slug}`} class="btn btn-xs btn-ghost text-neutral-content shrink-0 hidden sm:inline-flex">Change design</a>
    <a href="/dashboard" class="btn btn-xs btn-ghost text-neutral-content shrink-0">Dashboard</a>
  </div>
</div>
