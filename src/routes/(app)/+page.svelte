<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
</script>

<h1 class="text-xl font-bold">Dashboard of Advising Matrix</h1>
<p>Welcome, {data.user?.name}!</p>
<Button
	onclick={() =>
		toast.success('Event has been created', {
			description: 'Sunday, December 03, 2023 at 9:00 AM',
			action: {
				label: 'Undo',
				onClick: () => console.info('Undo')
			}
		})}>Show toast</Button
>
