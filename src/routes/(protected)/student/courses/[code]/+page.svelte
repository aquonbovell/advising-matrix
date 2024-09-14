<script lang="ts">
	import type { PageData } from './$types';
	import * as Button from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { page } from '$app/stores';

	export let data: PageData;
</script>

<div class="mx-auto max-w-xl">
	<Card.Root>
		<Card.Header>
			<Card.Title>{data.course?.code}</Card.Title>
			<Card.Description>{data.course?.name}</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.prerequisites.length > 0}
				<div class="flex flex-wrap gap-4">
					{#each data.prerequisites as prerequisite}
						<div class="flex w-max rounded-md border px-3">
							<Button.Root
								variant="link"
								href={`${$page.url.toString().split('/').slice(0, -1).join('/')}/${prerequisite.code}`}
							>
								{prerequisite.name}
							</Button.Root>
							<Badge class="self-center">
								{prerequisite.code}
							</Badge>
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex w-max rounded-md border">
					<Button.Root variant="ghost">No Prerequisites</Button.Root>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
