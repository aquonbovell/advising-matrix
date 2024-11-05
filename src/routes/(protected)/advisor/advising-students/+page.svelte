<script lang="ts">
	import { page } from '$app/stores';
	import DataTable from './data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import type { PageData } from './$types';
	import { selectedStudent } from '$lib/stores/advisor';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
	import { trpc } from '$lib/trpc';
	import { derived } from 'svelte/store';

	const pageIndex = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageIndex') || '0', 10)
	);
	const pageSize = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageSize') || '10', 10)
	);
	const order = derived(page, ($page) => $page.url.searchParams.get('order') || 'asc');

	$: studentQuery = trpc.students.getMyStudents.query({ page: $pageIndex, size: $pageSize });

	export let data: PageData;
</script>

<h1 class="text-2xl font-bold text-stone-800">
	My Students {#if $studentQuery.data}
		({$studentQuery.data?.count})
	{/if}
</h1>

{#if $studentQuery.isLoading}
	<p>Loading...</p>
{:else if $studentQuery.isError}
	<p style="color: red">{$studentQuery.error.message}</p>
{:else if $studentQuery.data}
	<DataTable data={$studentQuery.data} user={data.name} />

	<Dialog.Root
		open={$selectedStudent !== null}
		onOpenChange={(open) => {
			if (!open) {
				$selectedStudent = null;
			}
		}}
	>
		<Dialog.Content>
			{#if $selectedStudent !== null}
				<StudentChart studentId={$selectedStudent} />
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
