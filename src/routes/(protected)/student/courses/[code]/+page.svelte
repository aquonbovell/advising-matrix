<script lang="ts">
	import type { PageData } from './$types';
	import * as Button from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { page } from '$app/stores';
	import CourseTree from '$lib/components/coursetree/CourseTree.svelte';
	import { trpc } from '$lib/trpc';
	import { Loader2 } from 'lucide-svelte';

	export let data: PageData;

	$: course = trpc.courses.getSpecificCourse.query({ code: data.course.code });
</script>

<div class="container mx-auto space-y-8 py-6">
	{#if $course.isLoading}
		<div class="flex min-h-[200px] items-center justify-center">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
		</div>
	{:else if $course.isError}
		<div class="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
			{$course.error.message}
		</div>
	{:else if $course.data}
		<div class="space-y-8">
			<Card.Root class="mx-auto max-w-3xl">
				<Card.Header class="space-y-4">
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<Badge variant="outline" class="font-mono text-base">
								{$course.data.code}
							</Badge>
							<Card.Title class="text-2xl font-bold">{$course.data.name}</Card.Title>
						</div>
						<Badge variant="secondary" class="text-sm">
							Level {$course.data.level} • {$course.data.credits} Credits
						</Badge>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						<h3 class="text-sm font-semibold text-muted-foreground">Prerequisites</h3>
						{#if $course.data.prerequisites.length > 0}
							<div class="flex flex-wrap gap-3">
								{#each $course.data.prerequisites as prerequisite}
									<div class="group relative">
										<Button.Root
											variant="outline"
											href={`${$page.url.toString().split('/').slice(0, -1).join('/')}/${prerequisite.code}`}
											class="flex items-center gap-2 hover:bg-primary/5"
										>
											<span class="font-mono text-sm">{prerequisite.code}</span>
											<span class="text-sm text-muted-foreground group-hover:text-foreground">
												{prerequisite.name}
											</span>
										</Button.Root>
									</div>
								{/each}
							</div>
						{:else}
							<div class="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
								No prerequisites required
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<div class="space-y-4">
				<h2 class="text-lg font-semibold">Prerequisite Tree</h2>
				<CourseTree course={$course.data} />
			</div>
		</div>
	{/if}
</div>
