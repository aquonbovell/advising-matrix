<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';
	import * as Card from '$lib/components/ui/card';
	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="glass mx-auto mb-4 max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create A Student</Card.Title>
		<Card.Description>Manage this student account details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create
			data={data.form}
			users={data.availableUsers}
			advisors={data.advisors}
			majors={data.majors}
			minors={data.minors}
		/>
	</Card.Content>
</Card.Root>
