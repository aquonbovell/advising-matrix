<script lang="ts">
	import DataTable from '../advising-students/data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { selectedStudent } from '$lib/stores/advisor';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
</script>

<DataTable mode="all" />

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
