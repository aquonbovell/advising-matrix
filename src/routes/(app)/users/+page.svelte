<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import * as Button from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Users</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/users/create">Create User</Button.Root>
	{/if}
</div>

<DataTable
	data={data.users.map((u) => {
		return { ...u, userRole: data.user.role, role: u.role.toLowerCase() };
	})}
	{columns}
/>
