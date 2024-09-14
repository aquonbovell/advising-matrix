<script lang="ts">
	import type { UserRole } from '$lib/db/schema';
	import Menu from 'lucide-svelte/icons/menu';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import { UserMenuItems } from './navigation-data.svelte';
	import UserMenu from './user-menu.svelte';

	export let user: { name: string | undefined; role: UserRole | undefined };
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
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
				>
					<Menu class="h-4 w-4" />
					Home
				</a>
				{#if user.role}
					{#each UserMenuItems[user.role] ?? [] as item}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
						>
							<svelte:component this={item.icon} class="h-5 w-5" />
							<span>{item.label}</span>
						</a>
					{/each}
				{/if}
			</nav>
		</div>
		<UserMenu {user} />
	</div>
</aside>
