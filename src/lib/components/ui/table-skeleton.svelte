<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Skeleton from './skeleton/skeleton.svelte';

	export let rowCount = 10;
	export let columns: { width: string; name: string }[] = [
		{ width: 'w-[50px]', name: 'Checkbox' },
		{ width: 'w-[150px]', name: 'Code' },
		{ width: 'w-[400px]', name: 'Name' },
		{ width: 'w-[100px]', name: 'Level' },
		{ width: 'w-[100px]', name: 'Credits' },
		{ width: 'w-[100px]', name: 'Actions' }
	];

	$: skeletonRows = Array.from({ length: rowCount });
</script>

<div>
	<!-- Page Info -->
	<div class="flex-1 text-right text-sm text-muted-foreground">
		<Skeleton class="ml-auto h-4 w-32" />
	</div>

	<!-- Search and Filter -->
	<div class="flex items-center py-4">
		<Skeleton class="h-9 w-[320px]" />
		<Skeleton class="ml-auto h-9 w-[112px]" />
	</div>

	<!-- Table -->
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each columns as column}
						<Table.Head class={`${column.width} [&:has([role=checkbox])]:pl-3`}>
							<Skeleton class="h-4 w-[80%]" />
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each skeletonRows as _ (crypto.randomUUID())}
					<Table.Row>
						{#each columns as column}
							<Table.Cell>
								{#if column.name === 'Checkbox'}
									<Skeleton class="h-4 w-4" />
								{:else if column.name === 'Actions'}
									<div class="flex justify-end">
										<Skeleton class="h-8 w-8" />
									</div>
								{:else if column.name === 'Name'}
									<Skeleton class="h-4 w-[90%]" />
								{:else}
									<Skeleton class="h-4 w-[70%]" />
								{/if}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-end space-x-4 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			<Skeleton class="h-4 w-32" />
		</div>
		<div class="space-x-2">
			<Button variant="outline" size="sm" disabled>Previous</Button>
			<Button variant="outline" size="sm" disabled>Next</Button>
		</div>
	</div>
</div>
