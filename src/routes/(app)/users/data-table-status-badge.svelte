<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { cn } from '$lib/utils';

	let { status }: { status: 'Not Onboarded' | 'Onboarded' } = $props();
</script>

<Badge
	variant="outline"
	class={cn('w-max', status === 'Onboarded' ? 'bg-green-400' : 'bg-amber-400')}>{status}</Badge
>
