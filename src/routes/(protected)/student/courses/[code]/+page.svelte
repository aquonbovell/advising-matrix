<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/stores';

	export let data: PageData;

	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{data.course?.code}</Card.Title>
		<Card.Description>{data.course?.name}</Card.Description>
	</Card.Header>
	<Card.Content>
		<p>Level: {data.course?.level}</p>
		<p>Prerequisites: {data.prerequisites.length}</p>
		{#if data.prerequisites}
			<div class="my-2">
				{#each data.prerequisites as prerequisite}
					<div class="mb-2 grid grid-cols-[25px_1fr] items-start pb-2 last:mb-0 last:pb-0">
						<span class="flex h-2 w-2 translate-y-2 rounded-full bg-sky-500" />
						<div class="space-y-1">
							<a
								class="text-sm font-medium leading-none"
								href={`${$page.url.toString().split('/').slice(0, -1).join('/')}/${prerequisite.code}`}
							>
								{prerequisite.name}
							</a>
							<p class="text-sm text-muted-foreground">
								{prerequisite.code}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
	<Card.Footer>
		<p>Faculty: Sci Tech</p>
	</Card.Footer>
</Card.Root>
