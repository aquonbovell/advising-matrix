<script lang="ts">
	import { fly } from 'svelte/transition';
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
		studentCourses as studentGrades,
		totalCredits,
		codes,
		degree
	} from '$lib/stores/matrix';
	import type { NonNullableGrade, Program } from '$lib/types';
	import GradeDialog from '$lib/components/dialog/Grade.svelte';
	import CourseSelectionDialog from '$lib/components/dialog/Course.svelte';
	import CourseCard from '$lib/components/matrix/card.svelte';
	import { Loader2 } from 'lucide-svelte';

	let {
		data,
		studentCourses,
		userId
	}: {
		data: Program;
		studentCourses: {
			id: string;
			studentId: string;
			grade: string;
			requirementId: string;
			courseId: string;
			userId: string | null;
			name: string | null;
		}[];
		userId: string;
	} = $props();

	let addCourseDialog = $state(false);
	let addGradeDialog = $state(false);
	let selectedCourseId = $state<string[]>([]);
	let dialogRequirementID = $state<string>('');

	degree.set(data);
	studentGrades.set(
		studentCourses.map((sc) => ({ ...sc, grade: JSON.parse(sc.grade) as NonNullableGrade[] }))
	);

	// const courseGrades = writable(studentCourses.courses);

	// $: courseGrades.set(studentCourses.courses);

	// $: {
	// 	studentCoursesStore.set(studentCourses.courses);
	// 	degreeStore.set(degree);
	// 	codes.set(courseCodes);
	// }

	// const toastState = getToastState();

	// const updateGradesMutation = trpc.students.updateStudentGrades.mutation({
	// 	onSuccess: () => {
	// 		toastState.add('Success', 'Grades updated successfully', 'success');
	// 	},
	// 	onError: (error) => {
	// 		console.error('Failed to update grades:', error);
	// 		toastState.add('Error', 'Failed to update grades', 'error');
	// 	}
	// });

	let isAddCourseDialogOpen = $state(false);
	let isGradeDialogOpen = $state(false);
	// let selectedCourseId = '';
	let loading = $state(false);
	let currentRequirementId = $state<string | undefined>(undefined);

	async function saveGrades() {
		// $updateGradesMutation.mutateAsync({
		// 	grades: $studentCoursesStore.map((sc) => ({
		// 		...sc,
		// 		grades: sc.grade as NonNullableGrade[]
		// 	})),
		// 	studentId
		// });
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
			<Card.Title>{$degree.name}</Card.Title>

			<Button.Root variant="outline" onclick={saveGrades} disabled={loading}
				>{#if loading}
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
	{#each $degree.requirements as req}
		<Card.Root class="min-w-80 overflow-hidden pb-0">
			<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
				<Card.Title>Level {req.level.join(' / ')} - {req.credits} credits</Card.Title>
				{#if req.option === 'OPTIONAL' && $studentGrades
						.filter((sc) => sc.requirementId === req.id)
						.map((sc) => {
							const course = $codes.find((c) => c.id === sc.courseId);
							if (!course) return;
							return course;
						})
						.filter((c) => c !== undefined)
						.reduce((total, course) => total + course.credits, 0) < req.credits}
					<Button.Root class="!m-0" onclick={() => openAddCourseDialog(req.id)}
						>Add Course</Button.Root
					>
				{/if}
			</Card.Header>
			<Card.Content class="px-0 pb-0 @container">
				<ul class="grid @2xl:grid-cols-2">
					{#each req.courses as course}
						{@const isInStudentCourses = $studentGrades.some(
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

<CourseSelectionDialog
	bind:open={isAddCourseDialogOpen}
	dialogRequirementID={currentRequirementId}
	selectedCourseId={[]}
/>

<!-- <GradeDialog bind:open={isGradeDialogOpen} requirementId={currentRequirementId} /> -->
