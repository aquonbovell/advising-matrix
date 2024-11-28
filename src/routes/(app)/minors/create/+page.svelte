<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';
	import * as Card from '$lib/components/ui/card';
	export let data: PageData;
</script>

<Card.Root class="glass mx-auto max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create Matrix Minor</Card.Title>
		<Card.Description>Manage this minor details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create data={data.form} courses={data.courses} faculties={data.faculties} />
	</Card.Content>
</Card.Root>
