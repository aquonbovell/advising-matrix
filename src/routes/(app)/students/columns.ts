import type { ColumnDef } from '@tanstack/table-core';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';
import DataTableEmailButton from './data-table-email-button.svelte';
import type { UserRole } from '$lib/types';
import { writable } from 'svelte/store';

// This type is used to define the shape of our data.
export type Student = {
	id: string;
	email: string;
	alternateEmail: string;
	username: string;
	program: string;
	role: UserRole;
};

export const columns: ColumnDef<Student>[] = [
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
		accessorKey: 'username',
		id: 'username',
		header: 'Username'
	},
	{
		accessorKey: 'email',
		id: 'email',
		header: ({ column }) =>
			renderComponent(DataTableEmailButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			})
	},
	{
		accessorKey: 'alternateEmail',
		id: 'Alternate Email',
		header: 'Alternate Email'
	},
	{
		accessorKey: 'program',
		id: 'program',
		header: 'Program'
	},
	{
		header: 'Actions',

		id: 'actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, { id: row.original.id, role: row.original.role });
		}
	}
];
