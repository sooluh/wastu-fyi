<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import toast, { Toaster } from 'svelte-french-toast';
  import { getFlash } from 'sveltekit-flash-message';

  let { children } = $props();
  const flash = getFlash(page);

  $effect(() => {
    if (!$flash) return;

    switch ($flash.type) {
      case 'success':
        toast.success($flash.message);
        break;

      case 'error':
        toast.error($flash.message);
        break;
    }

    $flash = undefined;
  });
</script>

{@render children()}

<Toaster />
