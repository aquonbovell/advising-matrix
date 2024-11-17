<script lang="ts">
	import { UserMenuItems } from './navigation.items';
	import UserMenu from './user.menu.svelte';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import type { UserRole } from '$lib/types';

	let {
		user
	}: {
		user: {
			name: string;
			role: UserRole;
		};
	} = $props();
	let url = $page.url.toString();
</script>

<aside class="hidden border-r bg-muted/40 md:block">
	<div class="flex h-full max-h-screen flex-col">
		<div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
			<a href="/">
				<img src={'/banner.png'} alt="UWI Banner" />
			</a>
		</div>
		<div class="flex-1 pt-2">
			<nav class="grid items-start px-2 text-sm font-medium lg:px-4">
				<a
					href="/"
					class={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${url === '/' ? 'text-primary' : ''}`}
				>
					<Icon icon="fluent:home-24-filled" class="h-4 w-4" />
					Home
				</a>
				{#if user.role}
					{#each UserMenuItems[user.role] ?? [] as item}
						<a
							href={item.href}
							class={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${url.includes(item.href) ? 'text-primary' : ''}`}
						>
							<Icon icon={item.icon} />
							<span>{item.label}</span>
						</a>
					{/each}
				{/if}
			</nav>
		</div>
		<UserMenu {user} device="desktop" />
	</div>
</aside>
