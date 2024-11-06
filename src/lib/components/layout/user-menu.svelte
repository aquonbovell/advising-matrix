<script lang="ts">
	import type { UserRole } from '$lib/db/schema';
	import * as Button from '$lib/components/ui/button';
	import Settings from 'lucide-svelte/icons/settings';
	import Logout from 'lucide-svelte/icons/log-out';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import * as Popover from '$lib/components/ui/popover';
	import Avatar from '$lib/components/ui/Avatar.svelte';
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
	</div>
</div>
