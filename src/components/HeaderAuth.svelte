<script lang="ts">
  import { authClient } from "../lib/auth-client";
  const session = authClient.useSession();
  async function signOut() { await authClient.signOut(); window.location.reload(); }
</script>

{#if $session.data}
  <button on:click={signOut} class="text-sm font-medium text-purple-700 hover:text-purple-900">Sign out</button>
{:else}
  <a href="/sign-in" class="text-sm font-medium text-purple-700 hover:text-purple-900">Sign in</a>
{/if}
