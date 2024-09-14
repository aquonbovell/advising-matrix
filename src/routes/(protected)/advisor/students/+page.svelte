<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from '../advising-students/data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { selectedStudent } from '$lib/stores/advisor';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';

	export let data: PageData;
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
			<StudentChart studentId={$selectedStudent} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
