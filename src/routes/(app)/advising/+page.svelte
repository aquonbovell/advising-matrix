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
			id: string;
			advisor_names: string;
			exists: number;
			studentName: string;
			studentEmail: string;
			studentCreatedAt: string;
			studentUpdatedAt: string;
			studentInviteToken: string | null;
			studentInviteExpires: string | null;
			program: string;
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/advising?userId=' + data.user.id);

		const resData: {
			id: string;
			advisor_names: string;
			exists: number;
			studentName: string;
			studentEmail: string;
			studentCreatedAt: string;
			studentUpdatedAt: string;
			studentInviteToken: string | null;
			studentInviteExpires: string | null;
			program: string;
		}[] = await res.json();

		students.update(() => resData);
	});
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Students</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/students/create">Create Student</Button.Root>
	{/if}
</div>

<DataTable
	data={$students.map((s) => {
		return { ...s, role: data.user.role, exists: s.exists === 1 };
	})}
	{columns}
/>
