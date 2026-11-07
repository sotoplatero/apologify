<script lang="ts">
  // Signed in: "Your pages" (the dashboard has its own "New apology page").
  // Signed out (or still checking — most visitors are): Sign in + Write.
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
{#if !$session.data}
  <a href="/generator" class="ap-write"><span class="ap-write-long">Write an apology</span><span class="ap-write-short">Write</span></a>
{/if}
