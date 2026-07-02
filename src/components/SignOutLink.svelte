<script lang="ts">
  import { authClient } from "../lib/auth-client";

  let loading = $state(false);

  async function signOut() {
    loading = true;
    await authClient.signOut();
    window.location.href = "/";
  }
</script>

<button
  type="button"
  onclick={signOut}
  disabled={loading}
  class="link link-hover font-sans text-base-content/60 hover:text-error disabled:no-underline disabled:opacity-60"
>
  {loading ? "Signing out…" : "Sign out"}
</button>
