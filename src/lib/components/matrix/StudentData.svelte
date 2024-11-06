<script lang="ts">
	import { gradePoints, type Degree, type Grade, type StudentCoursesWithUser } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import Course from './Course.svelte';
	import Reload from 'svelte-radix/Reload.svelte';

	import {
		completedCourses,
		completedCredits,
		courseGrades,
		courses,
		degreeGPA,
		dialogRequirementID,
		gpa,
		outstandingCourses,
		pendingCourses,
		requiredCourses,
		requirements,
		selectedCourse,
		totalCourses,
		totalCredits
	} from '$lib/stores/student';
	import type { Selected } from 'bits-ui';
	import { Progress } from '$lib/components/ui/progress';
	import { fly } from 'svelte/transition';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';

	import type { UserRole } from '$lib/db/schema';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	export let student: { major_id: string; minor_id: string; id: string };
	export let role: UserRole | undefined;
	export let userId: string | null = null;
	const toastState = getToastState();

	export let degree: Degree;

	let addCourseDialog = false;
	let addGradeDialog = false;
	let loading = false;
	let selectedCourseId: Selected<number>;
	let selectedGrade: Selected<Grade>;

	export let studentCourses: StudentCoursesWithUser[];

	const degreeCourses = degree.requirements
		.flatMap((requirement) => requirement.courses)
		.map((course) => {
			return { id: course.id, credits: course.credits, code: course.code };
		});

	requirements.set(degree.requirements.flatMap((requirement) => requirement.id));

	courses.set(degreeCourses);

	const degreeRequiredCourses = degree.requirements
		.filter((requirement) => requirement.option === 'REQUIRED')
		.flatMap((requirement) => requirement.courses)
		.map((course) => {
			return { id: course.id, credits: course.credits };
		});

	requiredCourses.update((courses) => [...courses, ...degreeRequiredCourses]);

	studentCourses.forEach((course) => {
		if (!course.courseId) return;
		const courseGrade = <
			Record<
				string,
				{ requirementId: string; grade: Grade[]; userId: string | null; name: string | null }
			>
		>{};
		courseGrade[course.courseId] = {
			grade: course.grade.filter((g) => g !== '') as Grade[],
			requirementId: course.requirementId!,
			userId: course.userId,
			name: course.name
		};

		courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
	});

	let totalDegreeCredits = 0;
	let totalDegreeCourses = 0;

	degree.requirements.forEach((requirement) => {
		totalDegreeCredits += requirement.credits;
		totalDegreeCourses += requirement.credits / 3;
	});

	totalCredits.set(totalDegreeCredits);
	totalCourses.set(totalDegreeCourses);

	function openGradeDialog() {
		addGradeDialog = true;
	}

	function addCourse(selectedCourseId: Selected<number>, userId: string | null) {
		const courseGrade = <
			Record<
				string,
				{ requirementId: string; grade: Grade[]; userId: string | null; name: string | null }
			>
		>{};

		if (!selectedCourseId) {
			toastState.add('Error', 'No course was selected', 'error');
			return;
		}
		courseGrade[selectedCourseId.value] = {
			grade: [] as Grade[],
			requirementId: $dialogRequirementID!,
			name: '',
			userId: userId
		};
		courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
		selectedCourseId = {
			value: 0,
			label: ''
		};
	}

	async function handleSave(id: string) {
		const formData = new FormData();
		if (role !== 'STUDENT') {
			const studentCourses: Record<
				string,
				{
					requirementId: string;
					grade: Grade[];
					userId: string | null;
				}
			> = {};
			Object.entries($courseGrades).forEach(([courseId, courseData]) => {
				if (courseData.userId === userId) {
					studentCourses[courseId] = {
						grade: courseData.grade as Grade[],
						requirementId: courseData.requirementId!,
						userId: courseData.userId
					};
				}
			});
			formData.append('grades', JSON.stringify(studentCourses));
			formData.append('studentId', id);
		} else {
			formData.append('grades', JSON.stringify($courseGrades));
			formData.append('studentId', id);
		}
		const response = await fetch(`?/save`, {
			method: 'POST',
			body: formData
		});

		const result: ActionResult = deserialize(await response.text());

		alert(result.status);

		// if (result.status === 200) {
		// 	toastState.add('Notice', 'Grades saved successfully', 'success');
		// } else if (result.status === 400) {
		// 	toastState.add('Error', 'result.data', 'error');
		// } else if (result.status === 404) {
		// 	toastState.add('Error', 'result.data', 'error');
		// } else {
		// 	toastState.add('Error', 'An error occurred while saving grades', 'error');
		// }

		return;
	}
</script>

<div class="mx-auto flex flex-col gap-5" transition:fly={{ y: 30, delay: 200 }}>
	<!-- Degree Info -->
	<Card.Root class="min-w-80">
		<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
			<Card.Title>{degree.name}</Card.Title>
			<Button.Root
				variant="outline"
				disabled={loading}
				on:click={async () => {
					loading = true;
					await handleSave(student.id);
					loading = false;
				}}
				>{#if loading}<Reload class="mr-2 h-4 w-4 animate-spin" />{/if}
				{#if role !== 'STUDENT'}
					Save Suggestions
				{:else}
					Save Changes
				{/if}
			</Button.Root>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3 px-4 py-3 ">
			<div class="flex flex-wrap gap-3">
				<Button.Root variant="ghost" type="button">Degree GPA: {$degreeGPA}</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA: {$gpa}</Button.Root>
				<Button.Root variant="outline">Completed Courses ({$completedCourses})</Button.Root>
			</div>
			<!-- Courses Statistics -->
			<!-- <div class="flex flex-col gap-3">
				<div class="flex flex-wrap gap-3">
					<Button.Root variant="outline">All Courses</Button.Root>
					<!-- <Button.Root variant="outline">Outstanding Courses ({$outstandingCourses})</Button.Root>
					<Button.Root variant="outline">Pending Courses ({$pendingCourses})</Button.Root>
				</div>
			</div>  -->
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
				<Progress value={$completedCredits} max={$totalCredits} class="h-3" />
				<p class="w-fit">{$completedCredits} / {$totalCredits} Credits</p>
			</div>
		</Card.Content>
	</Card.Root>
	<!-- Degree Requirements -->
	{#each degree.requirements as req}
		<Card.Root class="min-w-80">
			<Card.Header class="flex flex-row items-baseline justify-between px-4 py-3 ">
				<Card.Title>Level {req.level.join(' / ')} - {req.credits} credits</Card.Title>
				{#if req.option === 'OPTIONAL'}
					<Button.Root
						class="!m-0"
						variant="outline"
						on:click={() => {
							$dialogRequirementID = req.id;
							addCourseDialog = true;
						}}
						disabled={req.courses
							.filter(
								(course) =>
									$courseGrades[course.id] && $courseGrades[course.id]?.requirementId === req.id
							)
							.reduce((acc, c) => acc + c.credits, 0) >= req.credits}
					>
						{#if role !== 'STUDENT'}
							Add Suggestion
						{:else}
							Add A Course
						{/if}
					</Button.Root>
				{/if}
			</Card.Header>
			<Card.Content class="p-0">
				<ul class="grid md:grid-cols-2">
					{#each req.courses.filter((course) => {
						if (req.option === 'OPTIONAL') {
							return $courseGrades[course.id] && $courseGrades[course.id]?.requirementId === req.id;
						}
						return true;
					}) as course}
						<Course
							{course}
							required={req.option === 'REQUIRED'}
							requirementId={req.id}
							{role}
							addGradeDialog={openGradeDialog}
						/>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
<Dialog.Root
	bind:open={addCourseDialog}
	onOpenChange={(open) => {
		if (!open) {
			selectedCourseId = { value: 0, label: '' };
		}
	}}
>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>Select a course</Dialog.Title>
			<Dialog.Description>
				<p class="pb-4">
					Select a course from the list below to add. The course will be added to your list of
					courses.
				</p>
				<div class="flex flex-col gap-3 md:flex-row">
					<Select.Root
						required={true}
						selected={selectedCourseId}
						onSelectedChange={(value) => {
							value && (selectedCourseId = value);
						}}
					>
						<Select.Trigger class="w-72 md:w-80">
							<Select.Value placeholder="Select A course" />
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{@const index = degree.requirements.findIndex((r) => r.id === $dialogRequirementID)}
							{@const requirement = degree.requirements[index]}
							{#if requirement}
								{#each requirement.courses.filter((course) => !$courseGrades[course.id] && !$requiredCourses
											.flatMap((c) => c.id)
											.includes(course.id)) as course}
									<Select.Item value={course.id}>{course.code} - {course.name}</Select.Item>
								{/each}
							{:else}
								<Select.Item value="No courses found" disabled>No courses found</Select.Item>
							{/if}
						</Select.Content>
					</Select.Root>
					<Dialog.Close
						on:click={() => {
							addCourseDialog = false;
							addCourse(selectedCourseId, userId);
						}}><Button.Root>Add Course</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	bind:open={addGradeDialog}
	onOpenChange={(open) => {
		if (!open) {
			selectedGrade = { value: undefined, label: '' };
		}
	}}
>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>{$selectedCourse.value?.code}</Dialog.Title>
			<Dialog.Description>
				{$selectedCourse.value?.name}
				<div class="flex gap-3 py-4">
					<Select.Root
						required={true}
						selected={selectedGrade}
						onSelectedChange={(value) => {
							value && (selectedGrade = value);
						}}
					>
						<Select.Trigger class="w-[200px]">
							<Select.Value placeholder="Enter Grade" />
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{#each Object.keys(gradePoints) as grade}
								<Select.Item value={grade}>{grade}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Dialog.Close
						on:click={() => {
							if ($selectedCourse.value?.id === undefined) return;
							const course = $courseGrades[$selectedCourse.value?.id];

							if (!selectedGrade) {
								toastState.add('Error', 'No grade was selected', 'error');
								return;
							}

							if (course && $courseGrades[$selectedCourse.value?.id]) {
								const grades = $courseGrades[$selectedCourse.value?.id]?.grade ?? [];
								$courseGrades[$selectedCourse.value?.id] = {
									grade: [...grades, selectedGrade.value],
									userId: userId,
									name: '',
									requirementId: $dialogRequirementID ?? ''
								};
							} else {
								$courseGrades[$selectedCourse.value?.id] = {
									grade: [selectedGrade.value],
									userId: userId,
									name: '',
									requirementId: $dialogRequirementID ?? ''
								};
							}

							selectedGrade = { value: undefined, label: '' };

							addGradeDialog = false;
						}}><Button.Root>Add Grade</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
