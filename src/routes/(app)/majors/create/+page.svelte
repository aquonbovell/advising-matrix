<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';
	import * as Card from '$lib/components/ui/card';
	export let data: PageData;
</script>

<Card.Root class="glass mx-auto mb-4 max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create A Major</Card.Title>
		<Card.Description>Manage this major details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create data={data.form} courses={data.courses} faculties={data.faculties} />
	</Card.Content>
</Card.Root>
