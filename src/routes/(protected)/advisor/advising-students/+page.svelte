<script lang="ts">
	import { page } from '$app/stores';
	import { goto, preloadData, pushState } from '$app/navigation';

	import DataTable from './data-table.svelte';

	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';
	import { selectedStudent } from '$lib/stores/advisor';
	import StudentChart from '$lib/components/StudentChart.svelte';

	export let data: PageData;
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

<pre>{JSON.stringify($selectedStudent, null, 2)}</pre>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-stone-800">My Students</h1>
	<Button href={`${$page.url.toString()}/invite`}>Invite A Student</Button>
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
			<StudentChart studentId={$selectedStudent}/>
		{/if}
	</Dialog.Content>
</Dialog.Root>
