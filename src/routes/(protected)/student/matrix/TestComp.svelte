<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { RouterOutputs } from '$lib/server/routes/_app';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select';
	import { Progress } from '$lib/components/ui/progress';
	import { derived, writable } from 'svelte/store';
	import { Course } from '$lib/components/matrix';
	import type { Selected } from 'bits-ui';

	import {
		degree as degreeStore,
		completedCredits,
		completedCourses,
		overallGPA,
		degreeGPA,
		program as programStore,
		studentCourses as studentCoursesStore,
		totalCredits,
		selectedCourse
	} from '$lib/stores/newstudent';
	import { gradePoints, type NonNullableGrade } from '$lib/types';
	import GradeDialog from '$lib/components/dialogs/GradeDialog.svelte';
	import CourseSelectionDialog from '$lib/components/dialogs/CourseSelectionDialog.svelte';
	import CourseCard from '$lib/components/matrix/CourseCard.svelte';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { trpc } from '$lib/trpc';
	import { Loader2 } from 'lucide-svelte';

	export let studentCourses: RouterOutputs['students']['getStudentCourses'];
	export let degree: RouterOutputs['students']['getStudentDegree'];
	export let program: RouterOutputs['students']['getStudentProgram'];

	const courseGrades = writable(studentCourses.courses);

	$: courseGrades.set(studentCourses.courses);

	$: {
		studentCoursesStore.set(studentCourses.courses);
		degreeStore.set(degree.degree);
	}

	const toastState = getToastState();

	const updateGradesMutation = trpc.students.updateStudentGrades.mutation({
		onSuccess: () => {
			toastState.add('Success', 'Grades updated successfully', 'success');
		},
		onError: (error) => {
			console.error('Failed to update grades:', error);
			toastState.add('Error', 'Failed to update grades', 'error');
		}
	});

	let isAddCourseDialogOpen = false;
	let isGradeDialogOpen = false;
	let selectedCourseId: Selected<number> = { value: 0, label: '' };
	let currentRequirementId: string | null = null;

	async function saveGrades() {
		const gradesToUpdate = $studentCoursesStore.map((course) => ({
			courseId: course.courseId,
			grade: course.grade as NonNullableGrade,
			requirementId: course.requirementId
		}));

		$updateGradesMutation.mutateAsync(gradesToUpdate);
	}

	function openAddCourseDialog(requirementId: string) {
		currentRequirementId = requirementId;
		isAddCourseDialogOpen = true;
	}

	function openGradeDialog(requirementId: string) {
		currentRequirementId = requirementId;
		isGradeDialogOpen = true;
	}
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6" transition:fly={{ y: 30, delay: 200 }}>
	<Card.Root>
		<Card.Header class="flex flex-row items-baseline justify-between">
			<Card.Title>{degree.degree.name}</Card.Title>
			<Button.Root
				variant="outline"
				on:click={saveGrades}
				disabled={$updateGradesMutation.isPending}
				>{#if $updateGradesMutation.isPending}
					<Loader2 class="mr-2 size-5 animate-spin" />
					Saving...
				{:else}Save Changes{/if}</Button.Root
			>
		</Card.Header>
		<Card.Content>
			<div class="flex gap-3 pb-4">
				<Button.Root variant="ghost" type="button">Degree GPA: {$degreeGPA}</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA: {$overallGPA}</Button.Root>
			</div>
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
				<Progress value={$completedCredits} max={$totalCredits} class="h-3" />
				<p class="w-fit">{$completedCredits} / {$totalCredits} Credits</p>
			</div>
		</Card.Content>
	</Card.Root>
	{#each degree.degree.requirements as req}
		<Card.Root>
			<Card.Header class="flex flex-row items-baseline justify-between">
				<Card.Title>
					{`Level ${req.level === 4 ? '2 / 3' : req.level} - ${req.credits} credits`}
				</Card.Title>
				{#if req.type === 'POOL'}
					<Button.Root
						on:click={() => {
							currentRequirementId = req.id;
							isAddCourseDialogOpen = true;
						}}>Add Course</Button.Root
					>
				{/if}
			</Card.Header>
			<Card.Content class="px-0">
				<ul class="divide-y-2">
					{#if Array.isArray(req.details)}
						{#each req.details as course}
							<CourseCard
								{course}
								required={req.type === 'POOL' ? false : true}
								addGradeDialog={() => openGradeDialog(req.id)}
							/>
						{/each}
					{/if}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}

	<h1>Test</h1>
	<p>Student Courses: {studentCourses.courses.length}</p>
	<p>Degree: {degree.degree.name}</p>
	<p>Program: {program.program.id}</p>
	<p>Completed Credits: {$completedCredits}</p>
	<p>Completed Courses: {$completedCourses}</p>
	<p>Overall GPA: {$overallGPA}</p>
</div>

<Dialog.Root
	bind:open={isAddCourseDialogOpen}
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
				<div class="flex gap-3">
					<Select.Root
						required={true}
						selected={selectedCourseId}
						onSelectedChange={(value) => {
							value && (selectedCourseId = value);
						}}
					>
						<Select.Trigger class="w-[340px]">
							<Select.Value placeholder="Select A course" />
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							<!-- {@const index = degree.requirements.findIndex((r) => r.id === $dialogRequirementID)}
						{@const requirement = degree.requirements[index]}
						{#if requirement}
							{#each requirement.details.filter((course) => !$courseGrades[course.id] && !$requiredCourses
										.flatMap((c) => c.id)
										.includes(course.id)) as course}
								<Select.Item value={course.id}>{course.code} - {course.name}</Select.Item>
							{/each}
						{:else}
							<Select.Item value="No courses found" disabled>No courses found</Select.Item>
						{/if} -->
						</Select.Content>
					</Select.Root>
					<Dialog.Close
						on:click={() => {
							isAddCourseDialogOpen = false;
							// addCourse(selectedCourseId);
						}}><Button.Root>Add Course</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
<!-- <CourseSelectionDialog
	bind:open={isAddCourseDialogOpen}
	requirementId={currentRequirementId}
/> -->

<GradeDialog bind:open={isGradeDialogOpen} requirementId={currentRequirementId} />
