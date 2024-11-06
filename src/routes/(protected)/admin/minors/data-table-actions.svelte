<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';

	export let id: string;
	const toastState = getToastState();
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
					navigator.clipboard.writeText(id);
					toastState.add('Notice', 'Course code copied to clipboard', 'success');
				}}
			>
				Copy minor id
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href={`/${$page.route.id?.split('/(protected)/')[1]}/${id}`}
			>Edit minor</DropdownMenu.Item
		>
		<DropdownMenu.Item>
			<form action="?/delete" method="post">
				<label for="id"><input type="hidden" name="id" value={id} /></label><button
					>Delete major</button
				>
			</form></DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
