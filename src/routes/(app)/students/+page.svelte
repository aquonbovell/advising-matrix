<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const students = writable<
		{
			program: string;
			email: string;
			alternateEmail: string;
			username: string;
			id: string;
			name: string;
			major: string;
			minor: string | null;
			major2: string | null;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/students');

		const data: {
			program: string;
			email: string;
			alternateEmail: string;
			username: string;
			id: string;
			name: string;
			major: string;
			minor: string | null;
			major2: string | null;
		}[] = await res.json();

		students.update(() => data);
	});
</script>

<div class="flex items-baseline justify-between">
	<h1 class="text-lg font-bold">Students</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/students/create" class="px-0">Create Student</Button.Root>
	{/if}
</div>

<DataTable
	data={$students.map((s) => {
		return { ...s, role: data.user.role };
	})}
	{columns}
/>
