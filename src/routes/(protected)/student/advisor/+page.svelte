<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	export let data: PageData;
</script>

{#if data.advisors}
	<div class="grid grid-cols-2 gap-6 md:grid-cols-3">
		{#each data.advisors as advisor}
			<Card.Root>
				<Card.Header>
					<Card.Title>Academic Advisor</Card.Title>
					<Card.Description>Card Description</Card.Description>
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
