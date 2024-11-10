<script lang="ts">
	import type { LayoutData } from './$types';
	import MobileSidebar from '$lib/components/shared/mobile-sidebar.svelte';
	import DesktopSidebar from '$lib/components/shared/desktop-sidebar.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';
	import { setToastState } from '$lib/components/toast/toast-state.svelte';
	export let data: LayoutData;
	setToastState();
</script>

{#if data.user}
	<Toast />

	<div
		class="relative z-10 grid min-h-screen w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:grid-cols-[200px_1fr] md:grid-rows-none"
	>
		<DesktopSidebar user={{ name: data.user.name, role: data.user.role }} />
		<MobileSidebar user={{ name: data.user.name, role: data.user.role }} />
		<main class="max-h-screen overflow-y-auto p-5">
			<slot />
		</main>
	</div>
{/if}
