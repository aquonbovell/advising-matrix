<script lang="ts">
	import Menu from 'lucide-svelte/icons/menu';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import User from './user.svelte';
	import type { UserRole } from '$lib/db/schema';
	import { specificMenuItems } from './data';
	import UserProfile from './user-profile.svelte';

	export let user: { name: string | undefined; role: UserRole | undefined };
</script>

<header
	class="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:hidden md:px-6"
>
	<Sheet.Root>
		<Sheet.Trigger asChild let:builder>
			<Button variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
				<Menu class="h-5 w-5" />
				<span class="sr-only">Toggle navigation menu</span>
			</Button>
		</Sheet.Trigger>
		<Sheet.Content side="left" class="flex max-w-[240px] flex-col p-0">
			<nav class="grid gap-2 p-8 text-lg font-medium">
				<a href="##" class="flex items-center gap-2 text-lg font-semibold">
					<!-- <Package2 class="h-6 w-6" /> -->
					<span class="sr-only">FST Matrix</span>
				</a>
				<a
					href="/"
					class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
				>
					<!-- <Home class="h-5 w-5" /> -->
					Dashboard
				</a>
				{#if user.role}
					{#each specificMenuItems[user.role] as item}
						<a
							href={item.href}
							class="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
						>
							{item.label}
						</a>
					{/each}
				{/if}
			</nav>
			<div class="mt-auto">
				<UserProfile {user} />
			</div>
		</Sheet.Content>
	</Sheet.Root>
	<User {user} />
</header>
