<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let slug: string;
  export let visibility: "private" | "public" = "private";
  const dispatch = createEventDispatcher();
  const origin =
    (import.meta.env.PUBLIC_SITE_URL as string) ||
    (typeof window !== "undefined" ? window.location.origin : "https://apologify.com");
  $: shareUrl = `${origin}/sorry/${slug}`;
  $: waUrl = `https://wa.me/?text=${encodeURIComponent("I made this for you 💜 " + shareUrl)}`;
  let copied = false;
  async function copy() {
    try { await navigator.clipboard.writeText(shareUrl); copied = true; setTimeout(() => (copied = false), 2000); } catch (_) {}
  }
</script>

<div class="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 text-center">
  <h2 class="text-2xl font-bold text-gray-900 mb-2">Your apology page is ready 💜</h2>
  <p class="text-gray-500 mb-6">
    Share this link.{visibility === "public" ? " It’s also listed publicly and can be found on Google." : " Only people with the link can see it."}
  </p>
  <div class="flex items-center gap-2 mb-4">
    <input class="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-50" value={shareUrl} readonly />
    <button on:click={copy} class="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium whitespace-nowrap">{copied ? "Copied!" : "Copy link"}</button>
  </div>
  <div class="flex flex-col sm:flex-row gap-3">
    <a href={waUrl} target="_blank" rel="noopener" class="flex-1 px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">Share on WhatsApp</a>
    <a href={shareUrl} target="_blank" rel="noopener" class="flex-1 px-5 py-3 bg-white text-purple-700 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-colors font-medium">Open page</a>
  </div>
  <button on:click={() => dispatch("restart")} class="mt-6 text-sm text-gray-400 hover:text-purple-600">Create another</button>
</div>
