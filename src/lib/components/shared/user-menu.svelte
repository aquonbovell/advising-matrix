<script lang="ts">
	import type { UserRole } from '$lib/db/schema';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Button from '$lib/components/ui/button';
	import Settings from 'lucide-svelte/icons/settings';
	import Logout from 'lucide-svelte/icons/log-out';
	import * as Popover from '$lib/components/ui/popover';
	import UserAvatar from './user-avatar.svelte';

	export let user: { name: string | undefined; role: UserRole | undefined };
	export let device: 'mobile' | 'desktop' = 'desktop';
</script>

<Popover.Root>
	<Popover.Trigger>
		<UserAvatar {user} />
	</Popover.Trigger>
	<Popover.Content
		side="top"
		align={device === 'mobile' ? 'end' : 'start'}
		class="flex w-full max-w-[8rem] flex-col bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5"
	>
		<Button.Root variant="ghost">
			<a href={`/${user.role?.toLocaleLowerCase()}/settings`} class="flex"
				><Settings class="mr-3 h-5 w-5 text-gray-400" /> Settings
			</a>
		</Button.Root>
		<form
			method="POST"
			action="/logout"
			use:enhance={async () => {
				return async ({ update }) => {
					await update();
					invalidateAll();
				};
			}}
		>
			<Button.Root type="submit" variant="ghost" class="w-full">
				<Logout class="mr-3 h-5 w-5 text-gray-400" />Logout</Button.Root
			>
		</form>
	</Popover.Content>
</Popover.Root>
