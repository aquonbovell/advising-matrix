<script lang="ts">
	import DataTable from './data-table.svelte';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { trpc } from '$lib/trpc';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	const pageIndex = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageIndex') || '0', 10)
	);
	const pageSize = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageSize') || '10', 10)
	);
	const order = derived(page, ($page) => $page.url.searchParams.get('order') || 'asc');

	$: courseQuery = trpc.courses.getCourses.query({ page: $pageIndex, size: $pageSize });
	$: skeletonRows = Array.from({ length: $pageSize });
</script>

<div class="container mx-auto space-y-6 py-6">
	<header class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight">Courses</h1>
	</header>

	{#if $courseQuery.isLoading}
		<TableSkeleton rowCount={$pageSize} />
	{:else if $courseQuery.isError}
		<div class="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
			{$courseQuery.error.message}
		</div>
	{:else if $courseQuery.data}
		<DataTable data={$courseQuery.data} />
	{/if}
</div>
