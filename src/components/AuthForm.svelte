<script lang="ts">
  import { authClient } from "../lib/auth-client";
  export let mode: "signin" | "signup" = "signin";
  export let redirectUrl = "/generator";
  export let providers: string[] = [];

  let name = "", email = "", password = "", error = "", loading = false;

  const providerLabels: Record<string, string> = { google: "Google", github: "GitHub" };

  async function social(provider: string) {
    loading = true; error = "";
    const { error: e } = await authClient.signIn.social({ provider, callbackURL: redirectUrl });
    if (e) { error = e.message || "Social sign-in failed."; loading = false; }
  }

  async function submit() {
    loading = true; error = "";
    const handlers = {
      onSuccess: () => { window.location.href = redirectUrl; },
      onError: (ctx: any) => { error = ctx.error?.message || "Something went wrong."; loading = false; },
    };
    if (mode === "signup") await authClient.signUp.email({ name, email, password }, handlers);
    else await authClient.signIn.email({ email, password }, handlers);
  }
</script>

<form on:submit|preventDefault={submit} class="w-full max-w-sm bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6 md:p-8 font-sans">
  <h1 class="font-display text-2xl font-semibold text-base-content mb-6 text-center">{mode === "signup" ? "Create your account" : "Sign in"}</h1>

  {#if providers.length}
    <div class="space-y-2 mb-4">
      {#each providers as p}
        <button type="button" on:click={() => social(p)} disabled={loading} class="btn btn-outline w-full font-medium">
          Continue with {providerLabels[p] || p}
        </button>
      {/each}
    </div>
    <div class="flex items-center gap-3 my-4 text-xs text-base-content/50">
      <span class="flex-1 h-px bg-base-300"></span>or<span class="flex-1 h-px bg-base-300"></span>
    </div>
  {/if}

  {#if mode === "signup"}
    <input bind:value={name} placeholder="Name" required class="input input-bordered w-full mb-3 bg-base-100" />
  {/if}
  <input bind:value={email} type="email" placeholder="Email" required class="input input-bordered w-full mb-3 bg-base-100" />
  <input bind:value={password} type="password" placeholder="Password (min 8 chars)" minlength="8" required class="input input-bordered w-full mb-4 bg-base-100" />
  {#if error}<div class="p-3 mb-4 bg-error/10 border border-error/25 rounded-xl text-error text-sm">{error}</div>{/if}
  <button type="submit" disabled={loading} class="btn btn-primary w-full">
    {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
  </button>
  <p class="text-center text-sm text-base-content/60 mt-4">
    {#if mode === "signup"}Already have an account? <a href="/sign-in" class="text-primary underline">Sign in</a>
    {:else}No account? <a href="/sign-up" class="text-primary underline">Create one</a>{/if}
  </p>
</form>
