<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="relative flex min-h-full min-w-80 items-center justify-center p-5 font-sans">
	{@render children()}
</div>
