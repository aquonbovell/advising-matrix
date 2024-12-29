<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { toast } from 'svelte-sonner';

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
			<DropdownMenu.Item
				onclick={() => {
					navigator.clipboard.writeText(id);
					toast.info('Major Id was copied!');
				}}
			>
				Copy Major ID
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<a href="/disciplines/majors/show/{id}">
			<DropdownMenu.Item>View Major</DropdownMenu.Item>
		</a>
	</DropdownMenu.Content>
</DropdownMenu.Root>
