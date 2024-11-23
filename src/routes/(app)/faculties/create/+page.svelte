<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';
	import * as Card from '$lib/components/ui/card';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="glass mx-auto max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create Matrix Faculty</Card.Title>
		<Card.Description>Manage this yaculty details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create data={data.form} />
	</Card.Content>
</Card.Root>
