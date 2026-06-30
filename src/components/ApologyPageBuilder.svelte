<script lang="ts">
  import { actions } from "astro:actions";
  import { tones, contextsByRecipient } from "../lib/apologyData.js";
  import { listThemes } from "../lib/themes.js";
  import { authClient } from "../lib/auth-client";
  import ApologyShareResult from "./ApologyShareResult.svelte";

  export let recipient: string;
  export let defaultTone: string;
  export let audience: "person" | "public" = "person";
  export let signUpUrl = "/sign-up";

  // Signed-in state is resolved client-side so the generator landing pages can
  // stay static (good for SEO and avoids ISR caching a per-user auth UI). The
  // real publish gate is enforced server-side in the createApologyPage action.
  const session = authClient.useSession();
  $: isSignedIn = !!$session.data;

  $: contexts = contextsByRecipient[recipient as keyof typeof contextsByRecipient] || [];
  const themes = listThemes();
  const isPublicAudience = audience === "public";

  let recipientName = "";
  let senderName = "";
  let context = "";
  let selectedTone = defaultTone;
  let selectedTheme = isPublicAudience ? "formal" : "classic";
  let publishPublic = false;
  let isGenerating = false;
  let error = "";
  let slug = "";
  let resultVisibility: "private" | "public" = "private";

  async function submit() {
    if (context.trim().length < 20) { error = "Please describe what happened (at least 20 characters)."; return; }
    isGenerating = true; error = "";
    try {
      const fd = new FormData();
      fd.append("relationship", recipient);
      if (recipientName.trim()) fd.append("recipientName", recipientName.trim());
      if (senderName.trim()) fd.append("senderName", senderName.trim());
      fd.append("audience", audience);
      fd.append("requestedVisibility", isSignedIn && publishPublic ? "public" : "private");
      fd.append("context", context);
      fd.append("tone", selectedTone);
      fd.append("theme", selectedTheme);
      const { data, error: actionError } = await actions.createApologyPage(fd);
      if (actionError) error = actionError.message;
      else if (data) { slug = data.slug; resultVisibility = data.visibility; }
    } catch (e) { error = "Something went wrong. Please try again."; console.error(e); }
    finally { isGenerating = false; }
  }

  function restart() {
    slug = ""; context = ""; recipientName = ""; senderName = "";
    selectedTone = defaultTone; selectedTheme = isPublicAudience ? "formal" : "classic";
    publishPublic = false; error = "";
  }
</script>

{#if !slug}
  <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
    <form on:submit|preventDefault={submit}>
      <div class="grid sm:grid-cols-2 gap-4 mb-5">
        {#if !isPublicAudience}
          <div>
            <label for="rname" class="font-semibold text-gray-900 block mb-2">Their name <span class="text-gray-400 font-normal">(optional)</span></label>
            <input id="rname" bind:value={recipientName} maxlength="60" placeholder="e.g. Mia" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        {/if}
        <div>
          <label for="sname" class="font-semibold text-gray-900 block mb-2">{isPublicAudience ? "Company / your name" : "Your name"} <span class="text-gray-400 font-normal">(optional)</span></label>
          <input id="sname" bind:value={senderName} maxlength="80" placeholder={isPublicAudience ? "e.g. Acme Inc." : "e.g. Sam"} class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
        </div>
      </div>

      <div class="mb-5">
        <div class="flex items-baseline justify-between mb-2">
          <label for="ctx" class="font-semibold text-gray-900">What happened?</label>
          <span class="text-xs text-gray-400 tabular-nums">{context.length}/500</span>
        </div>
        <textarea id="ctx" bind:value={context} maxlength="500" name="context" autocomplete="off" placeholder="Describe what happened and why you want to apologize..." class="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
        {#if contexts.length}
          <div class="flex flex-wrap gap-2 mt-2">
            {#each contexts.slice(0, 6) as c}
              <button type="button" on:click={() => (context = typeof c === "string" ? c : c.text)} class="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100">{typeof c === "string" ? c : c.label}</button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mb-5">
        <label for="tone" class="font-semibold text-gray-900 block mb-2">Tone</label>
        <select id="tone" bind:value={selectedTone} name="tone" class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
          {#each tones as t (t.value)}<option value={t.value}>{t.emoji} {t.label}</option>{/each}
        </select>
      </div>

      <div class="mb-6">
        <span class="font-semibold text-gray-900 block mb-2">Theme</span>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {#each themes as th}
            <button type="button" on:click={() => (selectedTheme = th.id)} class="relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all {selectedTheme === th.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}">
              <span class="text-2xl">{th.emoji}</span>
              <span class="text-xs text-gray-700">{th.label}</span>
              {#if th.premium}<span class="absolute top-1 right-1 text-[10px] bg-amber-400 text-white px-1 rounded">PRO</span>{/if}
            </button>
          {/each}
        </div>
        <p class="text-xs text-gray-400 mt-2">PRO themes preview as Classic on the free plan.</p>
      </div>

      <div class="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
        {#if isSignedIn}
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={publishPublic} class="mt-1 w-4 h-4 accent-purple-600" />
            <span class="text-sm text-gray-700"><strong>Publish publicly</strong> — make this findable on Google and listed on Apologify. Leave off to keep it private (link-only).</span>
          </label>
        {:else}
          <p class="text-sm text-gray-600">Your page will be <strong>private</strong> (only people with the link can see it). Want it public and findable on Google? <a href={signUpUrl} class="text-purple-600 underline">Create a free account</a>.</p>
        {/if}
      </div>

      {#if error}<div class="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm" role="alert">{error}</div>{/if}

      <button type="submit" disabled={isGenerating || context.trim().length < 20} class="w-full px-6 py-4 bg-purple-600 text-white text-lg font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
        {isGenerating ? "Creating your page..." : "Create my apology page"}
      </button>
    </form>
  </div>
{:else}
  <ApologyShareResult {slug} visibility={resultVisibility} on:restart={restart} />
{/if}
