<script lang="ts">
	import type { UserRole } from '$lib/db/schema';
	import * as Button from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import Menu from 'lucide-svelte/icons/menu';
	import Home from 'lucide-svelte/icons/house';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import { UserMenuItems } from './navigation-data.svelte';
	import UserMenu from './user-menu.svelte';
	import UserAvatar from './user-avatar.svelte';
	import { page } from '$app/stores';

	export let user: { name: string; role: UserRole };

	let sheetOpen = false;

	$: url = $page.url.toString();
</script>

<header
	class="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:hidden md:px-6"
>
	<Sheet.Root bind:open={sheetOpen}>
		<Sheet.Trigger asChild let:builder>
			<Button.Root variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
				<Menu class="h-5 w-5" />
				<span class="sr-only">Toggle navigation menu</span>
			</Button.Root>
		</Sheet.Trigger>
		<Sheet.Content side="left" class="flex w-max flex-col p-0">
			<nav class="grid gap-2 p-6 pt-12 text-lg font-medium">
				<a href="/" class="mx-[-0.65rem] flex max-w-44 items-center gap-4 rounded-xl">
					<img src={uwiBanner} class="" alt="UWI Banner" />
					<span class="sr-only">FST Matrix</span>
				</a>
				<a
					href="/"
					class={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${url.endsWith(user.role.toLowerCase()) ? 'text-primary' : ''}`}
				>
					<Home class="h-5 w-5" />
					Dashboard
				</a>
				{#if user.role}
					{#each UserMenuItems[user.role] ?? [] as item}
						<a
							href={item.href}
							on:click={() => (sheetOpen = false)}
							class={`mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground ${url.includes(item.href) ? 'text-primary' : ''}`}
						>
							<svelte:component this={item.icon} class="h-5 w-5" />
							<span>{item.label}</span>
						</a>
					{/each}
				{/if}
			</nav>
			<div class="mt-auto">
				<UserMenu {user} />
			</div>
		</Sheet.Content>
	</Sheet.Root>
	<UserAvatar {user} />
</header>
