<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import DataTable from './data-table.svelte';
</script>

<div class="mx-auto max-w-2xl">
	<div class="flex items-baseline justify-between">
		<h1 class="font-bold">Minors</h1>
		<Button href="/admin/minors/create" variant="link">New minor</Button>
	</div>

	<DataTable />
</div>
