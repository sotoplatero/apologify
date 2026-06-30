<script lang="ts">
  import { authClient } from "../lib/auth-client";
  export let mode: "signin" | "signup" = "signin";
  export let redirectUrl = "/generator";

  let name = "", email = "", password = "", error = "", loading = false;

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

<form on:submit|preventDefault={submit} class="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
  <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
  {#if mode === "signup"}
    <input bind:value={name} placeholder="Name" required class="w-full mb-3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
  {/if}
  <input bind:value={email} type="email" placeholder="Email" required class="w-full mb-3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
  <input bind:value={password} type="password" placeholder="Password (min 8 chars)" minlength="8" required class="w-full mb-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
  {#if error}<div class="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>{/if}
  <button type="submit" disabled={loading} class="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all">
    {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
  </button>
  <p class="text-center text-sm text-gray-500 mt-4">
    {#if mode === "signup"}Already have an account? <a href="/sign-in" class="text-purple-600 underline">Sign in</a>
    {:else}No account? <a href="/sign-up" class="text-purple-600 underline">Create one</a>{/if}
  </p>
</form>
