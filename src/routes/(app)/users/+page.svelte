<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let { data }: { data: PageData } = $props();

	const users = writable<
		{
			id: string;
			onboarded: number;
			invite_token: string | null;
			invite_expires: string | null;
			email: string;
			alternateEmail: string;
			name: string;
			username: string;
			role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/users?page=0&size=1');
		const data: {
			id: string;
			onboarded: number;
			invite_token: string | null;
			invite_expires: string | null;
			email: string;
			alternateEmail: string;
			name: string;
			username: string;
			role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
		}[] = await res.json();

		users.update(() => data);
	});
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Users</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/users/create">Create User</Button.Root>
	{/if}
</div>

<DataTable
	data={$users.map((u) => {
		return {
			...u,
			userRole: data.user.role,
			role: u.role.toLowerCase(),
			onboarded: u.onboarded === 1 ? true : false
		};
	})}
	{columns}
/>
