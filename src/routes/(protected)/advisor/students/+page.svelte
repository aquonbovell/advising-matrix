<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import DataTable from '../advising-students/data-table.svelte';
	import { preloadData, pushState, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import StudentChart from '$lib/components/StudentChart.svelte';
	import { selectedStudent } from '$lib/stores/advisor';

	async function showModal(e: MouseEvent) {
		if (e.metaKey || e.ctrlKey) return;
		const { href } = e.currentTarget as HTMLAnchorElement;
		const result = await preloadData(href);
		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, { student: result.data.student });
		} else {
			goto(href);
		}
	}
	let studentChartDialog = false;
	$: if ($page.state.student) {
		studentChartDialog = true;
	} else {
		studentChartDialog = false;
	}
</script>

<h1 class="text-2xl font-bold text-stone-800">All Students</h1>

<DataTable {data} />

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
			<StudentChart studentId={$selectedStudent}/>
		{/if}
	</Dialog.Content>
</Dialog.Root>