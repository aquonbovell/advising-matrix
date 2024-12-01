<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';
	import * as Card from '$lib/components/ui/card';
	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="glass mx-auto max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create A Department</Card.Title>
		<Card.Description>Manage this department details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create data={data.form} faculties={data.faculties} />
	</Card.Content>
</Card.Root>
