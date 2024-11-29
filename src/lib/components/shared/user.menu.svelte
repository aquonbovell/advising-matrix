<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Button from '$lib/components/ui/button';
	import User from './user.avatar.svelte';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	let {
		device = 'desktop'
	}: {
		device: 'mobile' | 'desktop';
	} = $props();

	async function handleLogout() {
		const response = await fetch('/logout', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			invalidateAll();
		}
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		<div class="border-t border-gray-200 p-4">
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center">
					<User size="sm" />
					<div class="ml-3">
						<p class="text-left text-sm font-medium text-gray-700">{$page.data.user.name}</p>
						<p class="text-left text-xs text-gray-500">{$page.data.user.role}</p>
					</div>
				</div>
			</div>
		</div>
	</Popover.Trigger>
	<Popover.Content
		side="top"
		align={'end'}
		class="flex w-full max-w-[8rem] flex-col bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5"
	>
		{#if $page.data.user.role === 'ADMIN'}
			<Button.Root variant="ghost" class=" w-full p-0" href="/settings">
				<Icon icon="mdi:gear-outline" /> Settings
			</Button.Root>
		{/if}

		<Button.Root
			type="button"
			onclick={handleLogout}
			variant="ghost"
			class="w-full"
			title="Log Out"
		>
			<Icon icon="mdi:logout" />Logout</Button.Root
		>
	</Popover.Content>
</Popover.Root>
