<script lang="ts">
	import { fly } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress';

	import {
		completedCredits,
		overallGPA,
		degreeGPA,
		studentCourses as studentGrades,
		totalCredits,
		codes,
		degree
	} from '$lib/stores/matrix';
	import type { CourseRequirementDetails, NonNullableGrade, Program } from '$lib/types';
	import GradeDialog from '$lib/components/dialog/Grade.svelte';
	import CourseSelectionDialog from '$lib/components/dialog/Course.svelte';
	import CourseCard from '$lib/components/matrix/card.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let {
		studentDegree,
		studentCourses,
		userId,
		studentId
	}: {
		studentDegree: Program;
		studentCourses: {
			id: string;
			studentId: string;
			grade: string[];
			requirementId: string;
			courseId: string;
			userId: string | null;
			name: string | null;
		}[];
		userId: string;
		studentId: string | undefined;
	} = $props();

	degree.set(studentDegree);
	studentGrades.set(studentCourses);

	codes.set(
		studentDegree.requirements
			.map((req) => req.courses)
			.flat()
			.map((course) => ({
				id: course.id,
				credits: course.credits,
				name: course.name,
				code: course.code
			}))
	);

	let isCourseDialogOpen = $state(false);
	let isGradeDialogOpen = $state(false);
	let loading = $state(false);
	let currentRequirementId = $state<string | undefined>(undefined);
	let selectedCourse = $state<CourseRequirementDetails | undefined>(undefined);

	function openCourseDialog(requirementId: string) {
		currentRequirementId = requirementId;
		isCourseDialogOpen = true;
	}

	function openGradeDialog(requirementId: string) {
		currentRequirementId = requirementId;
		isGradeDialogOpen = true;
	}
</script>

<div class="mx-auto flex flex-col gap-6" transition:fly={{ y: 30, delay: 200 }}>
	<Card.Root class="min-w-80 overflow-hidden">
		<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
			<Card.Title class="">Bsc. {$degree.name}</Card.Title>
			<form
				action="?/saveGrades"
				method="post"
				use:enhance={() => {
					return async ({ result }) => {
						// `result` is an `ActionResult` object
						if (result.type === 'failure') {
							toast.error(result.data?.message as string, { duration: 2000 });
						} else if (result.type === 'success') {
							toast.success('Grades saved successfully', { duration: 2000 });
						} else {
							toast.error('An error occurred', { duration: 2000 });
						}
						await applyAction(result);
					};
				}}
			>
				<label for="studentId" hidden
					>StudentId
					<input type="text" name="studentId" id="studentId" value={studentId} />
				</label>
				<label for="suggestions" hidden
					>Grades
					<input
						type="text"
						name="suggestions"
						id="suggestions"
						value={JSON.stringify($studentGrades)}
					/>
				</label>
				<Button.Root type="submit" variant="outline" size="sm">Save</Button.Root>
			</form>
			<!-- <Button.Root variant="outline" onclick={saveGrades} disabled={loading}
				>{#if loading}
					<Loader2 class="mr-2 size-5 animate-spin" />
					Saving...
				{:else}Save Changes{/if}</Button.Root
			> -->
		</Card.Header>
		<Card.Content class="flex flex-col gap-3 px-4 py-3 ">
			<div class="flex flex-wrap gap-3">
				<Button.Root variant="ghost" type="button">Degree GPA: {$degreeGPA}</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA: {$overallGPA}</Button.Root>
			</div>
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
				<Progress value={$completedCredits} max={$totalCredits} class="h-3" />
				<p class="w-fit">{$completedCredits} / {$totalCredits} Credits</p>
			</div>
		</Card.Content>
	</Card.Root>
	{#each $degree.requirements as req}
		<Card.Root class="min-w-80 overflow-hidden pb-0">
			<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3 ">
				<Card.Title class="text-base"
					>{#if req.level.includes(3) && req.level.includes(2)}
						Electives
					{:else}Level {req.level.join(' / ')}{/if} - {req.credits} credits</Card.Title
				>
				{#if req.option === 'AT MOST' && $studentGrades
						.filter((sc) => sc.requirementId === req.id)
						.map((sc) => {
							const course = $codes.find((c) => c.id === sc.courseId);
							if (!course) return;
							return course;
						})
						.filter((c) => c !== undefined)
						.reduce((total, course) => total + course.credits, 0) < req.credits}
					<Button.Root class="!m-0" size="sm" onclick={() => openCourseDialog(req.id)}
						>Add Course</Button.Root
					>
				{/if}
			</Card.Header>
			<Card.Content class=" p-0 pb-0">
				<ul class="grid md:grid-cols-2">
					{#each req.courses as course}
						{@const isInStudentCourses = $studentGrades.some(
							(sc) => sc.courseId === course.id && sc.requirementId === req.id
						)}
						{#if req.option === 'ALL' || isInStudentCourses}
							<CourseCard
								{course}
								required={req.option === 'ALL'}
								addGradeDialog={() => openGradeDialog(req.id)}
								bind:selectedCourse
							/>
						{/if}
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}
</div>

<CourseSelectionDialog
	bind:open={isCourseDialogOpen}
	dialogRequirementID={currentRequirementId}
	selectedCourseId={[]}
/>

<GradeDialog
	bind:open={isGradeDialogOpen}
	bind:requirementId={currentRequirementId}
	bind:selectedCourse
/>
