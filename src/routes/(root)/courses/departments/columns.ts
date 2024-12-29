import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import DataTableNameButton from './data-table-name-button.svelte';
import Checkbox from './data-table-checkbox.svelte';
import { renderComponent } from '$lib/components/ui/data-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Department = {
	id: string;
	name: string;
	facultyId: string | null;
	facultyName: string | null;
};

export const columns: ColumnDef<Department>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				controlledChecked: true,
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				controlledChecked: true,
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		header: 'Id',
		accessorKey: 'id'
	},
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableNameButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			})
	},

	{
		accessorKey: 'facultyName',
		header: 'Faculty'
	},

	{
		header: 'Actions',
		id: 'actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component

			return renderComponent(DataTableActions, {
				id: row.original.id
			});
		}
	}
];
