<script lang="ts">
	import type { PageData } from './$types';
	import Create from './create.form.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="glass mx-auto mb-4 max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Create A User</Card.Title>
		<Card.Description>Manage this user account details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Create data={data.form} />
	</Card.Content>
</Card.Root>
