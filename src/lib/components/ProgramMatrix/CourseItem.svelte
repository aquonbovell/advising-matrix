<script lang="ts">
	import { gradePoints } from '$lib/types';
	import type { CourseWithPrerequisites, Grade } from '$lib/types';
	import { derived, } from 'svelte/store';
	import { completedCourses, courseGrades, requirementCourses } from '$lib/stores/ProgramMatrix';

	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import TrashIcon from '../icons/TrashIcon.svelte';
	import type { User } from 'lucia';

	export let course: CourseWithPrerequisites;
	export let user: User | null;
	export let isPool: boolean = false;
	// export let completedCourses: Writable<Record<string, boolean>>;
	// export let courseGrades: any;

	const arePrerequisitesMetStore = derived(completedCourses, ($completedCourses) => {
		if (!course.prerequisites || course.prerequisites.length === 0) return true;
		return course.prerequisites.every((prereq) => $completedCourses[prereq.id]);
	});

	function addGrade(courseId: string, event: Event) {
		const target = event.target as HTMLSelectElement;

		// alert(`Course ID: ${courseId}, Grade: ${target.value}: Select: ${selectedGrade}`);

		if (!selectedGrade) return;

		courseGrades.update((grades) => {
			const courseGrades = grades[courseId] ?? [];
			courseGrades.push({ id: crypto.randomUUID(), grade: selectedGrade as Grade | '' });
			return { ...grades, [courseId]: courseGrades };
		});
	}

	function handleGradeChange(courseId: string, gradeId: string, event: Event) {
		const target = event.target as HTMLSelectElement;
		courseGrades.update((grades) => {
			const courseGrades = grades[courseId] ?? [];
			const gradeIndex = courseGrades.findIndex((grade) => grade.id === gradeId);
			if (gradeIndex === -1) {
				courseGrades.push({ id: gradeId, grade: target.value as Grade | '' });
			} else {
				courseGrades[gradeIndex] = {
					...courseGrades[gradeIndex],
					grade: target.value as Grade | ''
				};
			}
			return { ...grades, [courseId]: courseGrades };
		});
		completedCourses.update((completed: Record<string, boolean>) => ({
			...completed,
			[courseId]: !!target.value
		}));
	}

	let dialog = false;
	let selectedGrade = '';

	const submit: SubmitFunction = async (event) => {
		const gradeId = event.formData.get('gradeId');
		const courseId = event.formData.get('courseId');

		return async ({ update }) => {
			await update();
			courseGrades.update((grades) => {
				const courseGrades = grades[courseId?.toString()!] ?? [];
				const gradeIndex = courseGrades.findIndex((grade) => grade.id === gradeId);
				if (gradeIndex === -1) {
					return;
				} else {
					courseGrades.splice(gradeIndex, 1);
				}
				return { ...grades, [courseId?.toString()!]: courseGrades };
			});
		};
	};
</script>

<li>
	<div class={`flex items-center px-4 py-4 sm:px-6 ${isPool ? 'gap-3' : ''}`}>
		{#if isPool && user?.role === 'STUDENT'}
			<button
				class="text-red-500 hover:text-red-700"
				on:click={() => {
					courseGrades.update((grades) => {
						// Delete the courseId from the grades object
						const { [course.id]: _, ...updatedGrades } = grades;

						// Return the updated object without the courseId
						return updatedGrades;
					});
					requirementCourses.update((courses) =>
						courses.filter((c) => !c.startsWith(course.id.toString()))
					);
				}}><TrashIcon /></button
			>
		{/if}
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
			<div class="flex">
				{#each $courseGrades[course.id] ?? [] as courseGrade}
					<div class="mt-4 flex-shrink-0 sm:ml-2 sm:mt-0">
						<select
							name={`${course.id},${courseGrade.id}`}
							value={courseGrade.grade ?? ''}
							on:change={(event) => handleGradeChange(course.id.toString(), courseGrade.id, event)}
							class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
							disabled={!$arePrerequisitesMetStore || user?.role === 'ADVISOR'}
						>
							<option value="" disabled>Grade</option>
							{#each Object.keys(gradePoints) as grade}
								<option value={grade}>{grade}</option>
							{/each}
						</select>
						{#if user?.role === 'STUDENT'}
							<form method="post" class="inline-block" use:enhance={submit}>
								<input type="hidden" name="courseId" id="courseId" value={course.id} />
								<input type="hidden" name="gradeId" id="gradeId" value={courseGrade.id} />
								<button formaction="?/removeCourse" class="text-red-500 hover:text-red-700"
									><TrashIcon /></button
								>
							</form>
						{/if}
					</div>
				{/each}

				{#if $courseGrades[course.id]?.length === 0 || $courseGrades[course.id]
						?.flatMap((g) => g.grade)
						.every( (g) => g?.startsWith('F') ) || (course.prerequisites && course.prerequisites.length > 0)}
					{@const unmetPrerequisites = course.prerequisites.filter(
						(prereq) => !$completedCourses[prereq.id]
					)}
					{#if unmetPrerequisites.length === 0 && ($courseGrades[course.id]?.length === 0 || $courseGrades[course.id]
								?.flatMap((g) => g.grade)
								.every((g) => g?.startsWith('F')))}
						<Dialog.Root
							onOpenChange={(open) => {
								if (!open) {
									dialog = false;
								}
							}}
							open={dialog}
						>
							<Dialog.Trigger
								class={buttonVariants({ variant: 'outline' })}
								on:click={() => (dialog = true)}
								disabled={user?.role !== 'STUDENT'}>Enter Grade</Dialog.Trigger
							>
							<Dialog.Content class="sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Course - {course.name}</Dialog.Title>
									<Dialog.Description>Record your grade for this course here.</Dialog.Description>
								</Dialog.Header>
								<select
									class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
									bind:value={selectedGrade}
									disabled={unmetPrerequisites.length > 0}
								>
									<option value="">Select Grade</option>
									{#each Object.keys(gradePoints) as grade}
										<option value={grade}>{grade}</option>
									{/each}
								</select>
								<Dialog.Footer>
									<Button
										type="button"
										on:click={(event) => {
											// TODO: Implement addGrade
											addGrade(course.id.toString(), event);
											// dialog = false;
										}}>Add Grade</Button
									>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</li>
