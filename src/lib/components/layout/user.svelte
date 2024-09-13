<script lang="ts">
	import type { UserRole } from '$lib/db/schema';
	import Avatar from '../ui/Avatar.svelte';

	export let user: { name: string | undefined; role: UserRole | undefined };
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
