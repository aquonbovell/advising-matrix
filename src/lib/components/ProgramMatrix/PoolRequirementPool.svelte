<script lang="ts">
	import type { CourseWithRequirement, ProgramRequirement } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import { completedCourses, requirementCourses } from '$lib/stores/ProgramMatrix';
	import { writable, type Writable } from 'svelte/store';
	import { getPoolCourses } from './context';
	import CourseItem from './CourseItem.svelte';
	import type { User } from 'lucia';

	export let requirement: ProgramRequirement;
	export let user: User | null;
	export let onAddCourse: (requirementId: string) => void;

	let courses =
		(getPoolCourses(requirement.id) as Writable<CourseWithRequirement[]>) || writable([]);

	$: currentCredits = $courses
		.filter(
			(c) =>
				c.id in $completedCourses &&
				$requirementCourses.includes(c.id.toString().concat(',' + requirement.id))
		)
		.reduce((sum, course) => sum + course.credits, 0);
</script>

<li>
	<div class="flex flex-col">
		<div class="flex items-center justify-between px-4 pb-2 pt-4 sm:px-6">
			<span class="font-medium text-gray-900">
				{#if requirement.level !== null}Level {requirement.level}
				{:else}
					Degree
				{/if} Requirement ({currentCredits}/{requirement.credits}
				credits)
			</span>
			{#if currentCredits < requirement.credits}
				<Button on:click={() => onAddCourse(requirement.id)}>Add Course</Button>
			{/if}
		</div>
		<ul class="divide-y divide-gray-200">
			{#each $courses.filter((c) => c.id in $completedCourses && $requirementCourses.includes(c.id
							.toString()
							.concat(',' + requirement.id))) as course (course.id)}
				<CourseItem {course} isPool={true} {user} />
			{/each}
		</ul>
	</div>
</li>
