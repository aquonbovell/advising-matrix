<script lang="ts">
	import * as Button from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { UserMenuItems } from './navigation.items';
	import UserMenu from './user.menu.svelte';
	import { page } from '$app/stores';
	import type { UserRole } from '$lib/types';
	import Icon from '@iconify/svelte';

	let { user }: { user: { name: string | undefined; role: UserRole } } = $props();

	let sheetOpen = $state(false);
</script>

<header
	class="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:hidden md:px-6"
>
	<Sheet.Root bind:open={sheetOpen}>
		<Sheet.Trigger>
			<Button.Root variant="outline" size="icon" class="shrink-0 md:hidden">
				<Icon icon="ic:round-menu" />
				<span class="sr-only">Toggle navigation menu</span>
			</Button.Root>
		</Sheet.Trigger>
		<Sheet.Content side="left" class="flex w-max flex-col p-0">
			<nav class="grid gap-2 p-6 pt-12 text-lg font-medium">
				<a href="/" class="mx-[-0.65rem] flex max-w-44 items-center gap-4 rounded-xl">
					<img src={'/banner.png'} class="" alt="UWI Banner" />
					<span class="sr-only">FST Matrix</span>
				</a>
				<a
					href="/"
					onclick={() => (sheetOpen = false)}
					class={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${$page.route.id?.endsWith('/(app)') ? 'text-orange-600' : ''}`}
				>
					<Icon icon="fluent:home-24-filled" />
					Dashboard
				</a>
				{#if user.role}
					{#each UserMenuItems[user.role].sort((a, b) => {
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
							onclick={() => (sheetOpen = false)}
							class={`mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground ${$page.route.id?.includes(item.href) ? 'text-orange-600' : ''}`}
						>
							<Icon icon={item.icon} />
							<span>{item.label}</span>
						</a>
					{/each}
				{/if}
			</nav>
		</Sheet.Content>
	</Sheet.Root>
	<UserMenu {user} device="mobile" />
</header>
