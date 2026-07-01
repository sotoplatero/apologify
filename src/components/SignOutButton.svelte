<script lang="ts">
  import { authClient } from "../lib/auth-client";

  let loading = $state(false);

  async function signOut() {
    loading = true;
    await authClient.signOut();
    window.location.href = "/";
  }
</script>

<button onclick={signOut} disabled={loading} class="btn btn-ghost btn-sm">
  {loading ? "Signing out…" : "Sign out"}
</button>
