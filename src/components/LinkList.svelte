<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { m } from '$lib/paraglide/messages';
  import type { Link } from '$lib/server/db/schema';

  export let links: (Link & { clicks: number })[];
  export let onDelete: (uuid: string) => void;

  let domain = 'https://wastu.fyi';
  let copiedId: string | null = null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(`${domain}/${text}`);
    copiedId = id;
    setTimeout(() => (copiedId = null), 2_000);
  };

  onMount(() => {
    if (browser) {
      domain = window.location.origin;
    }
  });
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {#each links as link}
    <div
      class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div class="border-b border-gray-100 p-4">
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <h3 class="mb-1 truncate text-sm font-medium text-blue-600">{link.slug}</h3>

            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate text-xs text-gray-500 hover:underline"
            >
              {link.url}
            </a>
          </div>

          <span
            class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
          >
            {link.clicks}
            {m.clicks()}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between bg-gray-50 px-4 py-3">
        <div class="text-xs text-gray-500">{m.created()}: {link.createdAt.toLocaleString()}</div>

        <div class="flex space-x-2">
          <button
            type="button"
            on:click={() => copyToClipboard(link.slug, link.uuid)}
            class="inline-flex items-center rounded border border-transparent bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {copiedId === link.uuid ? m.copied() : m.copy()}
          </button>

          <button
            on:click={() => onDelete(link.uuid)}
            class="inline-flex items-center rounded border border-transparent bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            {m.delete()}
          </button>
        </div>
      </div>
    </div>
  {/each}
</div>
