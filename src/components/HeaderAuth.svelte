<script lang="ts">
  import { authClient } from "../lib/auth-client";
  const session = authClient.useSession();
  async function signOut() { await authClient.signOut(); window.location.reload(); }
</script>

{#if $session.data}
  <span class="flex items-center gap-3">
    <a href="/dashboard" class="text-sm font-medium text-base-content/70 hover:text-primary">Dashboard</a>
    <button onclick={signOut} class="text-sm font-medium text-primary hover:text-primary/80">Sign out</button>
  </span>
{:else}
  <a href="/sign-in" class="text-sm font-medium text-primary hover:text-primary/80">Sign in</a>
{/if}
