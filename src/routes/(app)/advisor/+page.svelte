<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="glass mx-auto max-w-3xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">Matrix Advisors</Card.Title>
		<Card.Description>Your assigned advisor for the matrix</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if data.advisors}
			<div class="grid grid-cols-2 gap-6">
				{#each data.advisors as advisor}
					<Card.Root>
						<Card.Header>
							<Card.Title>Academic Advisor</Card.Title>
							<Card.Description>For the advising matrix</Card.Description>
						</Card.Header>
						<Card.Content>
							<p>Name: {advisor.name}</p>
							<p>Email: <a href={`mailto:${advisor.email}`}>{advisor.email}</a></p>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title>Academic Advisor</Card.Title>
							<Card.Description>For the advising matrix</Card.Description>
						</Card.Header>
						<Card.Content>
							<p>Name: {advisor.name}</p>
							<p>Email: {advisor.email}</p>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title>Academic Advisor</Card.Title>
							<Card.Description>For the advising matrix</Card.Description>
						</Card.Header>
						<Card.Content>
							<p>Name: {advisor.name}</p>
							<p>Email: {advisor.email}</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<p>No advisor found</p>
		{/if}
	</Card.Content>
</Card.Root>
