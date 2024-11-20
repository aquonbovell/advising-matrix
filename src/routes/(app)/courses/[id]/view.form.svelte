<script lang="ts">
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Label from '$lib/components/ui/label';
	import * as Input from '$lib/components/ui/input';
	import { prerequisiteOptions } from './courseView.schema';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<form>
	<div class="grid w-full items-center gap-4">
		<div class="flex flex-col space-y-1.5">
			<Label.Root for="name">Name</Label.Root>
			<Input.Root id="name" placeholder="Human Anatomy" readonly value={data.course.name} />
		</div>

		<div class="flex flex-col space-y-1.5">
			<Label.Root for="username">Code</Label.Root>
			<Input.Root id="username" placeholder="HUAN1265" readonly value={data.course.code} />
		</div>
		<div class="flex flex-col space-y-1.5">
			<Label.Root for="credits">Credits</Label.Root>
			<Input.Root id="credits" type="number" readonly value={data.course.credits} />
		</div>
		<div class="flex flex-col space-y-1.5">
			<Label.Root for="comment">Comment</Label.Root>
			<Input.Root id="comment" type="text" readonly value={data.course.comment} />
		</div>
		<div class="flex flex-col space-y-1.5">
			<Label.Root for="level">Level</Label.Root>
			<Input.Root id="level" type="number" readonly value={data.course.level} />
		</div>
		<div class="flex flex-col space-y-1.5">
			<Label.Root for="prerequisiteType">Type of prerequisite</Label.Root>
			<RadioGroup.Root
				bind:value={data.course.prerequisiteType}
				class="flex flex-col space-y-1"
				name="prerequisiteType"
			>
				{#each prerequisiteOptions as option}
					<div class="flex items-center space-x-3 space-y-0">
						<RadioGroup.Item value={option} />
						<Label.Root class="font-normal"
							>{option.toLowerCase()} of the following prerequisites</Label.Root
						>
					</div>
				{/each}
			</RadioGroup.Root>
		</div>
		<div class="flex flex-col space-y-1.5">
			<Label.Root class="font-semibold">Prerequisites</Label.Root>
			<div class="flex flex-wrap gap-2">
				{#if data.course.prerequisites.length === 0}
					<Badge>No prerequisites</Badge>
				{:else}
					{#each data.course.prerequisites as prerequisite}
						<Badge>{prerequisite.name}</Badge>
					{/each}
				{/if}
			</div>
		</div>
		<div class="flex flex-col space-y-1.5">
			<Label.Root class="font-semibold">Level Restrictions</Label.Root>
			<div class="flex flex-wrap gap-2">
				{#if data.course.restrictions.length === 0}
					<Badge>No level restrictions</Badge>
				{:else}
					{#each data.course.restrictions as restriction}
						<div class="flex gap-2">
							<div>
								<Label.Root for="restrictionLevel">Level</Label.Root>
								<Input.Root
									id="restrictionLevel"
									type="number"
									readonly
									value={restriction.level}
								/>
							</div>
							<div>
								<Label.Root for="restrictionArea">Area</Label.Root>
								<Input.Root id="restrictionArea" type="text" readonly value={restriction.area} />
							</div>
							<div>
								<Label.Root for="restrictionCredits">Credits</Label.Root>
								<Input.Root
									id="restrictionCredits"
									type="text"
									readonly
									value={restriction.credits}
								/>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</form>
