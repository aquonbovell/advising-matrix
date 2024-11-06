<script lang="ts">
	import DataTable from '../advising-students/data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { selectedStudent } from '$lib/stores/advisor';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';

	const pageIndex = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageIndex') || '0', 10)
	);
	const pageSize = derived(page, ($page) =>
		parseInt($page.url.searchParams.get('pageSize') || '10', 10)
	);
	const order = derived(page, ($page) => $page.url.searchParams.get('order') || 'asc');

	$: studentQuery = trpc.students.fetchStudents.query({ page: $pageIndex, size: $pageSize });

	// $: console.log($studentQuery);
	export let data: PageData;
</script>

<h1 class="text-2xl font-bold text-stone-800">
	All Students
	{#if $studentQuery.data}
		<!-- Incorrect -->
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
