<script lang="ts">
	import { gradePoints } from '$lib/types';
	import type { CourseWithRequirement, ProgramRequirement } from '$lib/types';
	import { completedCourses, courseGrades, requirementCourses } from '$lib/stores/degreeTracker';
	import { writable, type Writable } from 'svelte/store';
	import { getPoolCourses } from './context';

	export let requirement: ProgramRequirement;
	let courses =
		(getPoolCourses(requirement.id) as Writable<CourseWithRequirement[]>) || writable([]);

	$: currentCredits = $courses
		.filter(
			(c) => c.id in $completedCourses && $requirementCourses.includes(c.id.concat(requirement.id))
		)
		.reduce((sum, course) => sum + course.credits, 0);
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
		</div>
		{#each $courses.filter((c) => c.id in $completedCourses && $requirementCourses.includes(c.id.concat(requirement.id))) as course (course.id)}
			<div class="mt-2 flex items-center">
				<div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
					<div>
						<div class="flex items-center">
							<input
								type="checkbox"
								id={`course-${course.id}`}
								name={`courses[${course.id}].completed`}
								bind:checked={$completedCourses[course.id]}
								class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								disabled
							/>
							<label for={`course-${course.id}`} class="ml-3 block">
								<span class="font-medium text-gray-900">{course.code}</span>
								<span class="ml-1 text-gray-500">{course.name}</span>
							</label>
						</div>
						<div class="mt-1 flex items-center text-sm text-gray-500">
							<span>Level: {course.level}</span>
							<span
								class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
							>
								{course.credits} Credits
							</span>
						</div>
						{#if course.prerequisites && course.prerequisites.length > 0}
							{@const unmetPrerequisites = course.prerequisites.filter(
								(prereq) => !$completedCourses[prereq.id]
							)}
							{#if unmetPrerequisites.length > 0}
								<div class="mt-1 text-sm">
									<span class="font-bold text-red-500">Prerequisites: </span>
									<span class="text-gray-700">
										{#each unmetPrerequisites as prereq}
											<span class="mr-2">{prereq.code}</span>
										{/each}
									</span>
								</div>
							{/if}
						{/if}
					</div>
					<div class="mt-4 flex flex-shrink-0 items-center sm:ml-5 sm:mt-0">
						<input
							type="hidden"
							name={`courses[${course.id}].requirementId`}
							value={requirement.id}
						/>
						<select
							name={`courses[${course.id}].grade`}
							value={$courseGrades[course.id] ?? ''}
							class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
							disabled={true}
							aria-readonly="true"
						>
							<option value="">No Grade</option>
							{#each Object.keys(gradePoints) as grade}
								<option value={grade}>{grade}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		{/each}
	</div>
</li>
