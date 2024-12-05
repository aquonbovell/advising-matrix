<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { columns, isOpen, userId } from './columns.svelte';
	import * as Button from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { applyAction, enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	const users = writable<
		{
			id: string;
			onboarded: number;
			invite_token: string | null;
			invite_expires: string | null;
			email: string;
			alternateEmail: string;
			name: string;
			username: string;
			role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
		}[]
	>([]);

	onMount(async () => {
		const res = await fetch('/api/users?page=0&size=1');
		const data: {
			id: string;
			onboarded: number;
			invite_token: string | null;
			invite_expires: string | null;
			email: string;
			alternateEmail: string;
			name: string;
			username: string;
			role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
		}[] = await res.json();
		users.update(() => data);
	});
</script>

<div class="flex justify-between">
	<h1 class="text-lg font-bold">Users</h1>
	{#if data.user?.role === 'ADMIN'}
		<Button.Root variant="link" href="/users/create">Create User</Button.Root>
	{/if}
</div>

<DataTable
	data={$users.map((u) => {
		return {
			...u,
			userRole: data.user.role,
			role: u.role.toLowerCase(),
			onboarded: u.onboarded === 1 ? true : false
		};
	})}
	{columns}
/>
<AlertDialog.Root bind:open={$isOpen}>
	<AlertDialog.Content class="">
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will allow the user to access their account with a new
				token.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form
				method="POST"
				action="?/reset"
				use:enhance={() => {
					return async ({ result }) => {
						// `result` is an `ActionResult` object
						isOpen.set(false);
						if (result.type === 'failure') {
							toast.error(result.data?.message as string, { duration: 2000 });
						} else if (result.type === 'success') {
							toast.success(result.data?.message as string, { duration: 2000 });
						} else {
							toast.error('An error occured', { duration: 2000 });
						}
						await applyAction(result);
					};
				}}
				class="flex items-baseline gap-2"
			>
				<label for="id">
					<input type="hidden" name="id" bind:value={$userId} />
				</label>
				<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
