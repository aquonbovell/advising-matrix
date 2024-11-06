<script lang="ts">
	import DataTable from './data-table.svelte';
	import * as Button from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	const pageIndex = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageIndex') || '0', 10)
	);
	const pageSize = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageSize') || '10', 10)
	);
	const order = derived(page, ($page) => $page.url.searchParams.get('order') || 'asc');

	$: courseQuery = trpc.courses.getCourses.query({ page: $pageIndex, size: $pageSize });
</script>

<div class="flex justify-between py-2">
	<h1 class="text-2xl font-bold text-stone-800">Courses</h1>
</div>
{#if $courseQuery.isLoading}
	<p>Loading...</p>
{:else if $courseQuery.isError}
	<p style="color: red">{$courseQuery.error.message}</p>
{:else if $courseQuery.data}
	<DataTable data={$courseQuery.data} />
{/if}
