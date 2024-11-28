<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { cn } from '$lib/utils';

	let {
		invite_token,
		invite_expires
	}: { invite_token: string | null; invite_expires: string | null } = $props();
</script>

<Badge
	variant="outline"
	class={cn(
		'w-max',
		invite_token === null
			? 'bg-green-400'
			: invite_expires && Date.now() < new Date(invite_expires).getTime()
				? 'bg-amber-400'
				: 'bg-red-400'
	)}
	>{#if invite_token === null}
		Active
	{:else if invite_expires && Date.now() < new Date(invite_expires).getTime()}
		Invited
	{:else}
		Expired
	{/if}
</Badge>
