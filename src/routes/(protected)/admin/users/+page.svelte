<script lang="ts">
	import * as Button from '$lib/components/ui/button';

	import DataTable from './data-table.svelte';
</script>

<div class="flex justify-between py-2">
	<h1 class="text-2xl font-bold text-stone-800">Users</h1>
	<Button.Root variant="link" href="/admin/users/create" class="p-0">Create User</Button.Root>
</div>

<DataTable />
