<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let { data }: { data: PageData } = $props();
	const faculties = writable<
		{
			id: string;
			code: string;
			name: string;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/faculties');

		const data: {
			id: string;
			code: string;
			name: string;
		}[] = await res.json();

		faculties.update(() => data);
	});
</script>

<div class="flex items-baseline justify-between">
	<h1 class="text-lg font-bold">Faculties</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/faculties/create" class="px-0">Create Faculty</Button.Root>
	{/if}
</div>

<DataTable
	data={$faculties.map((f) => {
		return { ...f, role: data.user.role };
	})}
	{columns}
/>
