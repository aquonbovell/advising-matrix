<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
</script>

<main
	class={cn(
		'flex min-h-dvh flex-col items-center justify-center bg-primary-foreground text-center text-foreground'
	)}
>
	<h1 class={cn('text-4xl')}>
		{$page.status}: {$page.error?.message || 'An unexpected error occurred'}
	</h1>
	<p class={cn('pt-5 text-2xl')}>
		Sorry for the inconvenience. Please try refreshing the page or contact support if the issue
		persists.
	</p>
</main>
