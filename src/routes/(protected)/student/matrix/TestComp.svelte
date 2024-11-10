<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { RouterOutputs } from '$lib/server/routers';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress';
	import { writable } from 'svelte/store';
	import type { Selected } from 'bits-ui';

	import {
		degree as degreeStore,
		completedCredits,
		overallGPA,
		degreeGPA,
		studentCourses as studentCoursesStore,
		totalCredits,
		codes
	} from '$lib/stores/newstudent';
	import type { NonNullableGrade } from '$lib/types';
	import GradeDialog from '$lib/components/dialogs/GradeDialog.svelte';
	import CourseSelectionDialog from '$lib/components/dialogs/CourseSelectionDialog.svelte';
	import CourseCard from '$lib/components/matrix/CourseCard.svelte';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { trpc } from '$lib/trpc';
	import { Loader2 } from 'lucide-svelte';

	export let studentCourses: RouterOutputs['students']['findStudentGrades'];
	export let degree: RouterOutputs['students']['findStudent'];
	export let studentId: string;

	export let courseCodes: RouterOutputs['students']['findCodes'];

	const courseGrades = writable(studentCourses.courses);

	$: courseGrades.set(studentCourses.courses);

	$: {
		studentCoursesStore.set(studentCourses.courses);
		degreeStore.set(degree);
		codes.set(courseCodes);
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
		$updateGradesMutation.mutateAsync({
			grades: $studentCoursesStore.map((sc) => ({
				...sc,
				grades: sc.grade as NonNullableGrade[]
			})),
			studentId
		});
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

<div class="mx-auto flex flex-col gap-6" transition:fly={{ y: 30, delay: 200 }}>
	<Card.Root class="min-w-80 overflow-hidden">
		<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
			<Card.Title>{degree.name}</Card.Title>

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
	{#each degree.requirements as req}
		<Card.Root class="min-w-80 overflow-hidden pb-0">
			<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
				<Card.Title>Level {req.level.join(' / ')} - {req.credits} credits</Card.Title>
				{#if req.option === 'OPTIONAL' && $studentCoursesStore
						.filter((sc) => sc.requirementId === req.id)
						.map((sc) => {
							const course = $codes.find((c) => c.id === sc.courseId);
							if (!course) return;
							return course;
						})
						.filter((c) => c !== undefined)
						.reduce((total, course) => total + course.credits, 0) < req.credits}
					<Button.Root class="!m-0" on:click={() => openAddCourseDialog(req.id)}
						>Add Course</Button.Root
					>
				{/if}
			</Card.Header>
			<Card.Content class="px-0 pb-0 @container">
				<ul class="grid @2xl:grid-cols-2">
					{#each req.courses as course}
						{@const isInStudentCourses = $studentCoursesStore.some(
							(sc) => sc.courseId === course.id && sc.requirementId === req.id
						)}
						{#if req.option === 'REQUIRED' || isInStudentCourses}
							<CourseCard
								{course}
								required={req.option === 'REQUIRED'}
								addGradeDialog={() => openGradeDialog(req.id)}
							/>
						{/if}
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}
</div>

<CourseSelectionDialog bind:open={isAddCourseDialogOpen} requirementId={currentRequirementId} />

<GradeDialog bind:open={isGradeDialogOpen} requirementId={currentRequirementId} />
