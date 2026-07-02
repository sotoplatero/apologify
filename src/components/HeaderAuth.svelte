<script lang="ts">
  import { authClient } from "../lib/auth-client";
  const session = authClient.useSession();
</script>

{#if $session.isPending}
  <span class="w-9 h-9 rounded-lg bg-base-300 animate-pulse" aria-hidden="true"></span>
{:else if $session.data}
  <a href="/dashboard" class="btn btn-ghost btn-sm btn-square" aria-label="Your dashboard" title="Your dashboard">
    <svg class="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h5v6H4V5zm10-1h5a1 1 0 011 1v3h-6V4zm0 6h6v9a1 1 0 01-1 1h-5v-10zM4 12h6v8H5a1 1 0 01-1-1v-7z"/></svg>
  </a>
{:else}
  <a href="/sign-in" class="btn btn-ghost btn-sm">Sign in</a>
{/if}
