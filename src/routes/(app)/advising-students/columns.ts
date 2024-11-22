import type { ColumnDef } from '@tanstack/table-core';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableActions from './data-table-actions.svelte';
import DataTableEmailButton from './data-table-email-button.svelte';
import DataTableBadge from './data-table-badge.svelte';

// This type is used to define the shape of our data.
export type Student = {
	id: string;
	advisor_names: string;
	exists: boolean;
	studentName: string;
	studentEmail: string;
	studentCreatedAt: string;
	studentUpdatedAt: string;
	studentInviteToken: string | null;
	studentInviteExpires: string | null;
	program: string;
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
		accessorKey: 'studentEmail',
		header: ({ column }) =>
			renderComponent(DataTableEmailButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			})
	},
	{
		accessorKey: 'studentName',
		header: 'Name'
	},
	{
		accessorKey: 'program',
		header: 'Degree Program'
	},
	{
		accessorKey: 'advisor_names',
		header: 'Advisors'
	},
	{
		accessorKey: 'studentCreatedAt',
		header: 'Date Joined',
		cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
	},
	{
		header: 'Status',
		cell: ({ row }) => {
			const value = row.original.studentInviteToken
				? 'Invited'
				: row.original.studentInviteExpires &&
					  new Date(row.original.studentInviteExpires) < new Date()
					? 'Pending'
					: 'Active';

			return renderComponent(DataTableBadge, { value });
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, {
				id: row.original.id,
				token: row.original.studentInviteToken,
				tokenExpiration: row.original.studentInviteExpires
			});
		}
	}
];
