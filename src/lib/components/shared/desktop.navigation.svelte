<script lang="ts">
	import { UserMenuItems } from './navigation.items';
	import UserMenu from './user.menu.svelte';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import type { UserRole } from '$lib/types';
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
					class={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${$page.route.id?.endsWith('/(app)') ? 'text-orange-500' : ''}`}
				>
					<Icon icon="fluent:home-24-filled" class="h-4 w-4" />
					Home
				</a>
				{#if $page.data.user.role}
					{#each UserMenuItems[$page.data.user.role as UserRole].sort((a, b) => {
						if (a.label < b.label) {
							return -1;
						}
						if (a.label > b.label) {
							return 1;
						}
						return 0;
					}) ?? [] as item}
						<a
							href={item.href}
							class={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${$page.route.id?.includes(item.href) ? 'text-orange-500' : ''}`}
						>
							<Icon icon={item.icon} />
							<span>{item.label}</span>
						</a>
					{/each}
				{/if}
			</nav>
		</div>
		<UserMenu device="desktop" />
	</div>
</aside>
