import type { ColumnDef } from '@tanstack/table-core';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { renderComponent } from '$lib/components/ui/data-table';
import DataTableStatusBadge from './data-table-status-badge.svelte';
import DataTableAccessBadge from './data-table-access-badge.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableEmailButton from './data-table-email-button.svelte';
import type { UserRole } from '$lib/types';

// This type is used to define the shape of our data.
export type User = {
	id: string;
	email: string;
	alternateEmail: string;
	username: string;
	invite_token: string | null;
	invite_expires: string | null;
	onboarded: boolean;
	userRole: UserRole;
};

export const columns: ColumnDef<User>[] = [
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
		accessorKey: 'role',
		id: 'role',
		header: 'Role'
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
		header: 'Status',
		id: 'status',
		cell: ({ row }) => {
			return renderComponent(DataTableStatusBadge, {
				status: row.original.onboarded ? 'Onboarded' : 'Not Onboarded'
			});
		}
	},
	{
		header: 'Access',
		id: 'access',
		cell: ({ row }) => {
			return renderComponent(DataTableAccessBadge, {
				invite_token: row.original.invite_token,
				invite_expires: row.original.invite_expires
			});
		}
	},
	{
		header: 'Actions',
		id: 'actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, {
				id: row.original.id,
				role: row.original.userRole,
				invite_token: row.original.invite_token
			});
		}
	}
];
