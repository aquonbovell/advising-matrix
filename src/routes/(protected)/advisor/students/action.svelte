<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let code: string;
	export let modalHandler: (e: MouseEvent) => void;
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
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(code)}>
				Copy student code
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href={$page.url + '/' + code + '/'}>View Student</DropdownMenu.Item>
		<a href={$page.url + '/' + code + '/overview'} on:click|preventDefault={modalHandler}
			>View Student Overview
		</a>
		<DropdownMenu.Item href={$page.url + '/' + code + '/degree-tracker'}
			>View Student Degree</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
