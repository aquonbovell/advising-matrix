<script lang="ts">
	import * as Button from '$lib/components/ui/button';
	import DataTable from './data-table.svelte';
</script>

<div class="flex justify-between py-2">
	<h1 class="text-2xl font-bold text-stone-800">Students</h1>
	<Button.Root variant="link" href="/admin/students/create" class="p-0">Create Student</Button.Root>
</div>

<DataTable />
