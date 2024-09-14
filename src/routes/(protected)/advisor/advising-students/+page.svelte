<script lang="ts">
	import { page } from '$app/stores';
	import DataTable from './data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import type { PageData } from './$types';
	import { selectedStudent } from '$lib/stores/advisor';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';

	export let data: PageData;
</script>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-stone-800">My Students</h1>
	<Button.Root href={`${$page.url.toString()}/invite`} variant="link">Invite A Student</Button.Root>
</div>

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
