<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{'FST Matrix: Admin Dashboard'}</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="grid auto-rows-min gap-4 md:grid-cols-3">
		<div class="aspect-video rounded-xl bg-muted/50">No Data</div>
		<div class="aspect-video rounded-xl bg-muted/50">No Data</div>
		<div class="aspect-video rounded-xl bg-muted/50">No Data</div>
	</div>
	<div class="grid auto-rows-min gap-4 md:grid-cols-3">
		<div class="aspect-video rounded-xl bg-muted/50">No Data</div>
		<div class="aspect-video rounded-xl bg-muted/50">No Data</div>
		<div class="aspect-video rounded-xl bg-muted/50">No Data</div>
	</div>
</div>
