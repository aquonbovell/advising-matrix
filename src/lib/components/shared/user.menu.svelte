<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Button from '$lib/components/ui/button';
	import User from './user.avatar.svelte';
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { UserRole } from '$lib/types';
	let {
		user,
		device = 'desktop'
	}: {
		user: {
			name: string | undefined;
			role: UserRole;
		} | null;
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
					<User name={user?.name ?? 'A'} size="sm" />
					<div class="ml-3">
						<p class="text-left text-sm font-medium text-gray-700">{user?.name}</p>
						<p class="text-left text-xs text-gray-500">{user?.role}</p>
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
		<Button.Root variant="ghost">
			<a href="/settings" class="flex"><Icon icon="mdi:gear-outline" /> Settings </a>
		</Button.Root>

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
