<script lang="ts">
	import { fade } from 'svelte/transition';

	export let textToCopy: string;

	let copied = false;
	let showTooltip = false;
</script>

<div class="relative inline-block">
	<button
		class="inline-block cursor-pointer rounded-md p-1 align-middle transition-colors hover:bg-gray-200"
		class:text-green-300={copied}
		on:click={() => {
			navigator.clipboard.writeText(textToCopy);
			copied = true;
			showTooltip = true;
			setTimeout(() => {
				copied = false;
				showTooltip = false;
			}, 2000);
		}}
	>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
				d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
			/>
			{#if copied}
				<path d="m12 15 2 2 4-4" />
			{/if}
		</svg>
	</button>

	{#if showTooltip}
		<div
			class="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white"
			transition:fade={{ duration: 250 }}
		>
			Copied!
			<div
				class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-x-4 border-t-4 border-x-transparent border-t-gray-800"
			/>
		</div>
	{/if}
</div>
