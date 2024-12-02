<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { enhance } from '$app/forms';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let {
		id,
		token,
		tokenExpiration
	}: { id: string; token: string | null; tokenExpiration: string | null } = $props();
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
			<DropdownMenu.Item
				onclick={() => {
					navigator.clipboard.writeText(id);
					toast.success('Student ID copied to clipboard', { duration: 2000 });
				}}
			>
				Copy Student ID
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			><Button.Root href={`/students/${id}`} variant="ghost" class="m-0 h-fit p-0"
				>View Student</Button.Root
			></DropdownMenu.Item
		>
		{#if token}
			<DropdownMenu.Item onclick={() => navigator.clipboard.writeText(token)}
				>Copy Student Token</DropdownMenu.Item
			>
		{/if}
		{#if tokenExpiration && new Date(tokenExpiration) < new Date()}
			<DropdownMenu.Item
				onclick={async () => {
					const response = await fetch('/api/renewtoken', {
						method: 'POST',
						body: JSON.stringify({ id })
					});

					const data = await response.json();
				}}>Reset Token</DropdownMenu.Item
			>
		{/if}
		<DropdownMenu.Item>
			<Button.Root href={`/advising/${id}`} variant="ghost" class="m-0 h-fit p-0"
				>View Student Matrix
			</Button.Root>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
