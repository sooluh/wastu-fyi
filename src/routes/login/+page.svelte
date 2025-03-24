<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import LoginForm from '$components/LoginForm.svelte';
</script>

<svelte:head>
  <title>{m.login()} - Wastu.FYI</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
  <div class="w-full max-w-md">
    <LoginForm />
  </div>
</main>
