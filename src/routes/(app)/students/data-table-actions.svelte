<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { applyAction, enhance } from '$app/forms';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';
	import type { UserRole } from '$lib/types';
	import { toast } from 'svelte-sonner';

	let { id, role }: { id: string; role: UserRole } = $props();
	let isOpen = $state(false);
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
				Copy Student ID
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			><Button.Root href={`/students/${id}`} variant="ghost" class="m-0 h-fit p-0"
				>View Student</Button.Root
			></DropdownMenu.Item
		><DropdownMenu.Item>
			<Button.Root href={`/students/${id}/matrix`} variant="ghost" class="m-0 h-fit p-0"
				>View Matrix
			</Button.Root>
		</DropdownMenu.Item>
		{#if role === 'ADMIN'}
			<DropdownMenu.Item>
				<Button.Root href={`/students/${id}/edit`} variant="ghost" class="m-0 h-fit p-0"
					>Edit Student
				</Button.Root>
			</DropdownMenu.Item>
		{/if}
		{#if role === 'ADMIN'}
			<DropdownMenu.Item class="m-0 p-0">
				<AlertDialog.Root bind:open={isOpen}>
					<AlertDialog.Trigger
						class={cn(
							buttonVariants({ variant: 'destructive' }),
							'm-0  block	 h-full w-full p-2 text-left'
						)}
					>
						Delete
					</AlertDialog.Trigger>
					<AlertDialog.Content class="w-10/12 rounded-lg md:w-full">
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently delete the account and remove
								the data from our servers.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => {
									return async ({ result }) => {
										// `result` is an `ActionResult` object
										if (result.type === 'failure') {
											isOpen = false;
											toast.error(result.data?.message as string, { duration: 2000 });
										} else if (result.type === 'success') {
											isOpen = false;
											toast.success('Course deleted successfully', { duration: 2000 });
										} else {
											isOpen = false;
											toast.error('An error occurred', { duration: 2000 });
										}
										await applyAction(result);
									};
								}}
								class="flex items-baseline gap-2"
							>
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
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
