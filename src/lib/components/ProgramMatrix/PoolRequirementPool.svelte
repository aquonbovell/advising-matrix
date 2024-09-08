<script lang="ts">
	import { gradePoints } from '$lib/types';
	import type { CourseWithRequirement, Grade, ProgramRequirement } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import TrashIcon from '../icons/TrashIcon.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { enhance } from '$app/forms';
	import {
		completedCourses,
		courseGrades,
		programCourses,
		requirementCourses
	} from '$lib/stores/ProgramMatrix';
	import { derived, writable, type Writable } from 'svelte/store';
	import { getPoolCourses } from './context';
	import { buttonVariants } from '../ui/button';
	import type { SubmitFunction } from '@sveltejs/kit';
	import CourseItem from './CourseItem.svelte';

	export let requirement: ProgramRequirement;
	export let onAddCourse: (requirementId: string) => void;

	let courses =
		(getPoolCourses(requirement.id) as Writable<CourseWithRequirement[]>) || writable([]);

	$: currentCredits = $courses
		.filter(
			(c) =>
				c.id in $completedCourses && $requirementCourses.includes(c.id.concat(',' + requirement.id))
		)
		.reduce((sum, course) => sum + course.credits, 0);

	const submit: SubmitFunction = async (event) => {
		// const requirementId = String(event.formData.get('requirementId'))
		const courseId = String(event.formData.get('courseId'));

		return async ({ update }) => {
			await update();
			courseGrades.update((grades) => {
				// Delete the courseId from the grades object
				const { [courseId]: _, ...updatedGrades } = grades;

				// Return the updated object without the courseId
				return updatedGrades;
			});

			requirementCourses.update((courses) =>
				courses.filter((c) => c !== courseId.concat(',' + requirement.id))
			);
		};
	};
</script>

<li>
	<div class="flex flex-col px-4 py-4 sm:px-6">
		<div class="flex items-center justify-between">
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
		{#each $courses.filter((c) => c.id in $completedCourses && $requirementCourses.includes(c.id.concat(',' + requirement.id))) as course (course.id)}
			<!-- <pre>{JSON.stringify(course, null, 2)}</pre> -->
			<div class="">
				<button
					class="text-red-500 hover:text-red-700"
					on:click={() => {
						courseGrades.update((grades) => {
							// Delete the courseId from the grades object
							const { [course.id]: _, ...updatedGrades } = grades;

							// Return the updated object without the courseId
							return updatedGrades;
						});
						requirementCourses.update((courses) => courses.filter((c) => !c.startsWith(course.id)));
					}}><TrashIcon /></button
				>
				<!-- <form method="post" class="inline-block" use:enhance={submit}> -->
				<!-- <input type="hidden" name="courseId" id="courseId" value={course.id} /> -->
				<!-- <input type="hidden" name="requirementId" id="requirementId" value={requirement.id} /> -->
				<!-- <button formaction="?/deleteCourse" class="text-red-500 hover:text-red-700"
						><TrashIcon /></button
					>
				</form> -->

				<CourseItem {course} />
			</div>
		{/each}
	</div>
</li>
