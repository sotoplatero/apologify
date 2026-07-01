<script lang="ts">
  import { authClient } from "../lib/auth-client";
  export let mode: "signin" | "signup" = "signin";
  export let redirectUrl = "/dashboard";
  export let providers: string[] = [];

  let error = "", loading = false;
  const providerLabels: Record<string, string> = { google: "Google", github: "GitHub" };

  async function social(provider: string) {
    loading = true; error = "";
    const { error: e } = await authClient.signIn.social({ provider, callbackURL: redirectUrl });
    if (e) { error = e.message || "Sign-in failed. Please try again."; loading = false; }
  }
</script>

<div class="w-full max-w-sm bg-base-100 rounded-2xl shadow-sm border border-base-300 p-7 md:p-9 font-sans text-center">
  <span class="text-4xl" role="img" aria-label="Love letter">💌</span>
  <h1 class="font-display text-2xl font-semibold text-base-content mt-3 mb-2">
    {mode === "signup" ? "Create your account" : "Welcome back"}
  </h1>
  <p class="text-sm text-base-content/60 mb-6">
    Sign in to publish your page and keep all your apologies in one place.
  </p>

  {#if providers.length}
    <div class="space-y-2.5">
      {#each providers as p}
        <button type="button" on:click={() => social(p)} disabled={loading} class="btn btn-primary btn-block gap-2">
          {loading ? "Redirecting…" : `Continue with ${providerLabels[p] || p}`}
        </button>
      {/each}
    </div>
  {:else}
    <p class="text-error text-sm">Sign-in is temporarily unavailable. Please try again later.</p>
  {/if}

  {#if error}
    <div class="p-3 mt-4 bg-error/10 border border-error/25 rounded-xl text-error text-sm" role="alert">{error}</div>
  {/if}

  <p class="text-xs text-base-content/50 mt-6 leading-relaxed">
    No passwords. We only use your account to save your pages and tie them to you.
  </p>
</div>
