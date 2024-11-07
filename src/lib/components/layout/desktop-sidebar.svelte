<script lang="ts">
	import type { UserRole } from '$lib/db/schema';
	import Menu from 'lucide-svelte/icons/menu';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import { UserMenuItems } from './navigation-data.svelte';
	import UserMenu from './user-menu.svelte';
	import { page } from '$app/stores';

	import * as Button from '$lib/components/ui/button';
	import Settings from 'lucide-svelte/icons/settings';
	import Logout from 'lucide-svelte/icons/log-out';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import * as Popover from '$lib/components/ui/popover';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let settings = false;

	export let user: { name: string; role: UserRole };
	$: url = $page.url.toString();
</script>

<aside class="hidden border-r bg-muted/40 md:block">
	<div class="flex h-full max-h-screen flex-col gap-2">
		<div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
			<a href="/">
				<img src={uwiBanner} alt="UWI Banner" />
			</a>
		</div>
		<div class="flex-1">
			<nav class="grid items-start px-2 text-sm font-medium lg:px-4">
				<a
					href="/"
					class={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${url.endsWith(user.role.toLowerCase()) ? 'text-primary' : ''}`}
				>
					<Menu class="h-4 w-4" />
					Home
				</a>
				{#if user.role}
					{#each UserMenuItems[user.role] ?? [] as item}
						<a
							href={item.href}
							class={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${url.includes(item.href) ? 'text-primary' : ''}`}
						>
							<svelte:component this={item.icon} class="h-5 w-5" />
							<span>{item.label}</span>
						</a>
					{/each}
				{/if}
			</nav>
		</div>
		<Popover.Root>
			<Popover.Trigger>
				<UserMenu {user} />
			</Popover.Trigger>
			<Popover.Content
				side="top"
				align="start"
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
	</div>
</aside>
