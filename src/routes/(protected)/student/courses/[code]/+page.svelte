<script lang="ts">
	import type { PageData } from './$types';
	import * as Button from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { page } from '$app/stores';
	import CourseTree from '$lib/components/coursetree/CourseTree.svelte';
	import { trpc } from '$lib/trpc';

	export let data: PageData;

	$: course = trpc.courses.getSpecificCourse.query({ code: data.course.code });
</script>

{#if $course.isLoading}
	<p>Loading...</p>
{:else if $course.isError}
	<p style="color: red">{$course.error.message}</p>
{:else if $course.data}
	<div class="mx-auto max-w-xl">
		<Card.Root>
			<Card.Header>
				<Card.Title>{$course.data.code}</Card.Title>
				<Card.Description>{$course.data.name}</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if $course.data.prerequisites.length > 0}
					<div class="flex flex-wrap gap-4">
						{#each $course.data.prerequisites as prerequisite}
							<div class="flex w-max rounded-md border px-3">
								<Button.Root
									variant="link"
									href={`${$page.url.toString().split('/').slice(0, -1).join('/')}/${prerequisite.code}`}
								>
									{prerequisite.name}
								</Button.Root>
								<Badge variant="secondary">
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
	<CourseTree course={$course.data} />
{/if}
