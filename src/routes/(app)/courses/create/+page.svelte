<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import Create from './create.form.svelte';

	export let data: PageData;
</script>

<Card.Root class="glass mx-auto max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create Matrix Course</Card.Title>
		<Card.Description>Manage this course details and requirements</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create data={data.form} courses={data.courses} departments={data.departments} />
	</Card.Content>
</Card.Root>
