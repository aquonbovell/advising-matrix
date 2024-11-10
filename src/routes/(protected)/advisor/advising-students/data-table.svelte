<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import {
		addPagination,
		addSortBy,
		addTableFilter,
		addHiddenColumns,
		addSelectedRows
	} from 'svelte-headless-table/plugins';
	import { writable } from 'svelte/store';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import * as Table from '$lib/components/ui/table';
	import DataTableActions from './data-table-actions.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import DataTableCheckbox from './data-table-checkbox.svelte';

	import DataTableTag from './data-table-tag.svelte';
	import { trpc } from '$lib/trpc';
	import type { RouterOutputs } from '$lib/server/routers';

	export let mode: 'all' | 'mine' = 'all';

	const index = writable(0);
	const size = writable(10);
	const orderBy = writable<'asc' | 'desc'>('asc');
	const search = writable('');

	$: students = trpc.advisor.students.query({
		page: $index,
		size: $size,
		orderBy: $orderBy,
		search: $search.trim(),
		mode
	});

	const paginatedData = writable<RouterOutputs['advisor']['students']['students']>([]);

	const countStore = writable(0);

	$: {
		if ($students.isSuccess) {
			paginatedData.set($students.data.students);
			countStore.set($students.data.count);
		}
	}

	const table = createTable(paginatedData, {
		page: addPagination({
			serverSide: true,
			serverItemCount: countStore,
			initialPageIndex: $index,
			initialPageSize: $size
		}),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		hide: addHiddenColumns(),
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'student_id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'student_name',
			header: 'Name'
		}),
		table.column({
			accessor: 'email',
			header: 'Email'
		}),
		table.column({
			accessor: 'program_name',
			header: 'Program'
		}),
		table.column({
			accessor: 'advisor_names',
			header: 'Advisor'
		}),
		table.column({
			accessor: 'created_at',
			header: 'Joined',
			cell: ({ value }) => {
				return new Date(value).toLocaleDateString();
			},
			plugins: {
				filter: {
					exclude: false
				}
			}
		}),
		table.column({
			accessor: ({ invite_token, invite_expires }) => {
				return { invite_token, invite_expires };
			},
			header: 'Status',
			cell: ({ value }) => {
				return createRender(DataTableTag, {
					invite_token: value.invite_token,
					invite_expires: value.invite_expires
				});
			},
			plugins: {
				filter: {
					exclude: false
				}
			}
		}),

		table.column({
			accessor: ({ student_id, invite_token, invite_expires, advisor_names, exists }) => {
				return { student_id, invite_token, invite_expires, advisor_names, exists };
			},
			header: 'Actions',
			cell: ({ value }) => {
				return createRender(DataTableActions, {
					code: value.student_id,
					token: value.invite_token,
					expires: value.invite_expires,
					exists: value.exists
				});
			},
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns, rows } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;

	const { filterValue } = pluginStates.filter;

	const { hiddenColumnIds } = pluginStates.hide;

	const { selectedDataIds } = pluginStates.select;

	const ids = flatColumns.map((col) => col.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);

	filterValue.subscribe((value) => {
		search.set(value);
	});

	const hidableCols = ['created_at', 'updated_at', 'token', 'advisor', 'email'];
</script>

<h1 class="text-2xl font-bold text-stone-800">
	All Students
	{#if $students.data}
		({$students.data.count})
	{/if}
</h1>

<div>
	<div class="flex-1 text-right text-sm text-muted-foreground">
		Page {$pageIndex + 1} of{' '}
		{Math.floor($rows.length / $pageSize) + 1}
	</div>
	<div class="flex items-center py-4">
		<Input
			class="max-w-sm"
			placeholder="Filter student names or programs..."
			type="text"
			bind:value={$filterValue}
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="ml-auto" builders={[builder]}>
					Columns <ChevronDown class="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hidableCols.includes(col.id)}
						<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if cell.id === 'credits'}
											<div class="text-right">
												<Render of={cell.render()} />
											</div>
										{:else if cell.id === 'program_name' || cell.id === 'email'}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown class={'ml-2 h-4 w-4'} />
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										{#if cell.id === 'amount'}
											<div class="text-right font-medium">
												<Render of={cell.render()} />
											</div>
										{:else if cell.id === 'program_name' || cell.id === 'name' || cell.id === 'advisor'}
											<div class="min-w-max capitalize">
												<Render of={cell.render()} />
											</div>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-4 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of{' '}
			{$rows.length} row(s) selected.
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Previous</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
		>
	</div>
</div>
