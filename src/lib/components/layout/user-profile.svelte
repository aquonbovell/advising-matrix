<script lang="ts">
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import Menu from 'lucide-svelte/icons/menu';
	import { Button } from '$lib/components/ui/button/index.js';
	import Users from 'lucide-svelte/icons/users';
	import Settings from 'lucide-svelte/icons/settings';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import type { UserRole } from '$lib/db/schema';
	import * as Popover from '$lib/components/ui/popover';
	import Avatar from '../ui/Avatar.svelte';
	import { specificMenuItems } from './data';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	export let user: { name: string | undefined; role: UserRole | undefined };

	let settings = false;
</script>

<div class="border-t border-gray-200 p-4">
	<div class="flex w-full items-center justify-between">
		<div class="flex items-center">
			<Avatar name={user.name ?? 'A'} size="sm" />
			<div class="ml-3">
				<p class="text-left text-sm font-medium text-gray-700">{user.name}</p>
				<p class="text-left text-xs text-gray-500">{user.role}</p>
			</div>
		</div>
		<Popover.Root bind:open={settings}>
			<Popover.Trigger>
				<ChevronDown
					class={`h-5 w-5 text-gray-400 transition-transform duration-500 ${settings ? 'rotate-180  ' : ''}`}
					on:click={() => (settings = !settings)}
				/>
			</Popover.Trigger>
			<Popover.Content
				class="w-fit translate-x-16 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5"
			>
				<Button variant="ghost">
					<a href="##" class="flex"><Settings class="mr-3 h-5 w-5 text-gray-400" /> Settings </a>
				</Button>
				<form
					method="POST"
					action="/logout"
					use:enhance={async () => {
						return async ({ result, update }) => {
							await update();
							invalidateAll();
						};
					}}
				>
					<Button type="submit" variant="ghost" class="w-full">Logout</Button>
				</form>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>
