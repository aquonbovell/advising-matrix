<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Desktop from '$lib/components/shared/desktop.navigation.svelte';
	import Mobile from '$lib/components/shared/mobile.navigation.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div
	class="relative z-10 grid min-h-screen w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:grid-cols-[200px_1fr] md:grid-rows-none"
>
	<Desktop user={{ name: data.user.name, role: data.user.role }} />
	<Mobile user={{ name: data.user.name, role: data.user.role }} />
	<main class="max-h-screen overflow-y-auto p-5">
		<Toaster />
		{@render children()}
	</main>
</div>
