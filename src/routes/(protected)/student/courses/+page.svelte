<script lang="ts">
	import DataTable from './data-table.svelte';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { trpc } from '$lib/trpc';

	const pageIndex = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageIndex') || '0', 10)
	);
	const pageSize = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageSize') || '10', 10)
	);
	const order = derived(page, ($page) => $page.url.searchParams.get('order') || 'asc');

	$: courseQuery = trpc.courses.getCourses.query({ page: $pageIndex, size: $pageSize });
</script>

{#if $courseQuery.isLoading}
	<p>Loading...</p>
{:else if $courseQuery.isError}
	<p style="color: red">{$courseQuery.error.message}</p>
{:else if $courseQuery.data}
	<DataTable data={$courseQuery.data} />
{/if}
