<script lang="ts">
  import { authClient } from "../lib/auth-client";
  const session = authClient.useSession();
</script>

{#if $session.isPending}
  <span class="ap-nav-link ap-nav-pending" aria-hidden="true">Sign in</span>
{:else if $session.data}
  <a href="/dashboard" class="ap-nav-link">Your pages</a>
{:else}
  <a href="/sign-in" class="ap-nav-link">Sign in</a>
{/if}
