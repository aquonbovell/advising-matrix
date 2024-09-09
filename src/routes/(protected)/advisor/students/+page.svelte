<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import DataTable from '../advising-students/data-table.svelte';
	import { preloadData, pushState, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog';

	import StudentChart from '../advising-students/[id]/overview/+page.svelte';

	async function showModal(e: MouseEvent) {
		if (e.metaKey || e.ctrlKey) return;
		const { href } = e.currentTarget as HTMLAnchorElement;
		const result = await preloadData(href);
		console.log(result);
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
<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<DataTable {data} {showModal} />

<Dialog.Root
	open={studentChartDialog}
	onOpenChange={(open) => {
		if (!open) {
			history.back();
		}
	}}
>
	<Dialog.Overlay class="z-[100] bg-background/20 backdrop-blur-sm" />
	<Dialog.Content class=" z-[100]">
		{#if $page.state.student}
			<StudentChart data={{ user: data.user, student: $page.state.student, props: { id: '' } }} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
