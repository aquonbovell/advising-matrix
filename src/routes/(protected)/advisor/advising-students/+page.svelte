<script lang="ts">
	import { page } from '$app/stores';
	import { goto, preloadData, pushState } from '$app/navigation';

	import DataTable from './data-table.svelte';

	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';
	import StudentChart from './[id]/overview/+page.svelte';

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

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-stone-800">My Students</h1>
	<Button href={`${$page.url.toString()}/invite`}>Invite A Student</Button>
</div>

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
