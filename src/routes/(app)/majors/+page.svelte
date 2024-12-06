<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let { data }: { data: PageData } = $props();
	const majors = writable<
		{
			id: string;
			code: string;
			level: number;
			name: string;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/majors?page=0&size=1');

		const data: {
			id: string;
			code: string;
			level: number;
			name: string;
		}[] = await res.json();

		majors.update(() => data);
	});
</script>

<div class="flex items-baseline justify-between">
	<h1 class="text-lg font-bold">Majors</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/majors/create" class="px-0">Create Major</Button.Root>
	{/if}
</div>

<DataTable
	data={$majors.map((m) => {
		return { ...m, role: data.user.role };
	})}
	{columns}
/>
