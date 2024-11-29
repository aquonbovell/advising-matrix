<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	const courses = writable<
		{
			id: string;
			code: string;
			level: number;
			name: string;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/courses?page=0&size=1');

		const data: {
			id: string;
			code: string;
			level: number;
			name: string;
		}[] = await res.json();

		courses.update(() => data);
	});
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Courses</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/courses/create" class="px-0">Create Course</Button.Root>
	{/if}
</div>

<DataTable
	data={$courses.map((c) => {
		return { ...c, role: data.user.role };
	})}
	{columns}
/>
