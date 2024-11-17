<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { enhance } from '$app/forms';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';

	let { id }: { id: string } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button.Root {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button.Root>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>
				Copy User ID
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			><Button.Root href={`/users/${id}`} variant="ghost" class="m-0 h-fit p-0"
				>View User</Button.Root
			></DropdownMenu.Item
		>
		<DropdownMenu.Item>
			<Button.Root href={`/users/${id}/edit`} variant="ghost" class="m-0 h-fit p-0"
				>Edit User
			</Button.Root>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="m-0 p-0">
			<AlertDialog.Root>
				<AlertDialog.Trigger
					class={cn(
						buttonVariants({ variant: 'destructive' }),
						'm-0  block	 h-full w-full p-2 text-left'
					)}
				>
					Delete
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently delete the account and remove the
							data from our servers.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<form method="POST" action="?/delete" use:enhance class="flex gap-2">
							<label for="id">
								<input type="hidden" name="id" value={id} />
							</label>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
						</form>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
