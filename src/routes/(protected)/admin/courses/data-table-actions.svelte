<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { trpc } from '$lib/trpc';

	export let code: string;
	const toastState = getToastState();

	let dialogOpen = false;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item
				on:click={() => {
					navigator.clipboard.writeText(code);
					toastState.add('Notice', 'Course code copied to clipboard', 'success');
				}}
			>
				Copy course code
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href={`${$page.url.toString()}/${code}`}>Edit course</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => (dialogOpen = true)}
			><Button variant="destructive">Delete course</Button>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger></Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers. {code}
			</Dialog.Description>
			<div class="flex justify-end gap-4">
				<Dialog.Close>
					<form action="?/delete" method="post">
						<label for="code" hidden></label>
						<input type="hidden" name="code" value={code} />
						<Button
							type="submit"
							variant="destructive"
							on:click={() => {
								dialogOpen = false;
							}}
						>
							Yes, delete course
						</Button>
					</form>
				</Dialog.Close>
				<Dialog.Close>
					<Button>Cancel</Button>
				</Dialog.Close>
			</div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
