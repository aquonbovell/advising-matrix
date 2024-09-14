<script lang="ts">
	import { gradePoints, type Grade } from '$lib/types';
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
		selectedCourse,
		totalCourses,
		totalCredits
	} from '$lib/stores/student';
	import type { Selected } from 'bits-ui';
	import { Progress } from '$lib/components/ui/progress';
	import { fly } from 'svelte/transition';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { fetchCourses, fetchDegree } from './utils';

	export let data: { program: { major_id: string; minor_id: string; id: string } };
	const toastState = getToastState();

	let addCourseDialog = false;
	let addGradeDialog = false;
	let loading = false;
	let selectedCourseId: Selected<number>;
	let selectedGrade: Selected<Grade>;

	$: ({ major_id, minor_id, id } = data.program);

	onMount(async () => {
		const degree = await fetchDegree(major_id, minor_id);
		const studentCourses = await fetchCourses(id);

		const coursesDB = degree.requirements
			.flatMap((req) => req.details)
			.map((course) => {
				return { id: course.id, credits: course.credits, code: course.code };
			});

		courses.set(coursesDB);

		const requiredCoursesDegree = degree.requirements
			.filter((req) => req.type === 'CREDITS')
			.flatMap((req) => req.details)
			.map((course) => {
				return { id: course.id, credits: course.credits };
			});

		requiredCourses.update((courses) => [...courses, ...requiredCoursesDegree]);

		studentCourses.forEach((course) => {
			if (!course.courseId) return;
			const courseGrade = <Record<string, { requirementId: string; grade: Grade[] }>>{};
			courseGrade[course.courseId] = {
				grade: course.grades as Grade[],
				requirementId: course.requirementId!
			};
			courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
		});

		let totalDegreeCredits = 0;
		let totalDegreeCourses = 0;

		degree.requirements.forEach((req) => {
			totalDegreeCredits += req.credits;
			totalDegreeCourses += req.credits / 3;
		});

		totalCredits.set(totalDegreeCredits);
		totalCourses.set(totalDegreeCourses);
	});

	function openGradeDialog() {
		addGradeDialog = true;
	}

	function addCourse(selectedCourseId: Selected<number>) {
		const courseGrade = <Record<string, { requirementId: string; grade: Grade[] }>>{};

		if (!selectedCourseId) {
			toastState.add('Error', 'No course was selected', 'error');
			return;
		}
		courseGrade[selectedCourseId.value] = {
			grade: [] as Grade[],
			requirementId: $dialogRequirementID!
		};
		courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
		selectedCourseId = {
			value: 0,
			label: ''
		};
	}

	async function saveGrades(id: string) {
		const respone = await fetch(`/api/student/${id}/grades`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ grades: $courseGrades })
		});

		const content = await respone.json();

		if (content.status === 200) {
			toastState.add('Notice', 'Grades saved successfully', 'success');
		} else if (content.status === 404) {
			toastState.add('Error', content.message, 'error');
		} else {
			toastState.add('Error', 'An error occurred while saving grades', 'error');
		}
	}
</script>

{#await fetchDegree(major_id, minor_id)}
	<p>Please wait loading...</p>
{:then degree}
	<div class="mx-auto flex max-w-3xl flex-col gap-6" transition:fly={{ y: 30, delay: 200 }}>
		<!-- Degree Info -->
		<Card.Root>
			<Card.Header class="flex flex-row items-baseline justify-between">
				<Card.Title>{degree.name}</Card.Title>
				<Button.Root
					variant="outline"
					disabled={loading}
					on:click={async () => {
						loading = true;
						await saveGrades(data.program.id);
						loading = false;
					}}
					>{#if loading}<Reload class="mr-2 h-4 w-4 animate-spin" />{/if}Save Changes</Button.Root
				>
			</Card.Header>
			<Card.Content>
				<div class="flex gap-3 pb-4">
					<Button.Root variant="ghost" type="button">Degree GPA: {$degreeGPA}</Button.Root>
					<Button.Root variant="ghost" type="button">Overall GPA: {$gpa}</Button.Root>
				</div>
				<!-- Courses Statistics -->
				<!-- <div class="flex flex-col gap-3">
					<div class="flex flex-wrap gap-3">
						<Button.Root variant="outline">All Courses</Button.Root>
						<Button.Root variant="outline">Completed Courses ({$completedCourses})</Button.Root>
						<Button.Root variant="outline">Pending Courses ({$pendingCourses})</Button.Root>
						<Button.Root variant="outline">Outstanding Courses ({$outstandingCourses})</Button.Root> 
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
			<Card.Root>
				<Card.Header class="flex flex-row items-baseline justify-between">
					<Card.Title
						>{`Level ${req.level === 4 ? '2 / 3' : req.level} - ${req.credits} credits`}</Card.Title
					>
					{#if req.type === 'POOL'}
						<Button.Root
							variant="outline"
							on:click={() => {
								$dialogRequirementID = req.id;
								addCourseDialog = true;
							}}
							disabled={req.details
								.filter(
									(course) =>
										$courseGrades[course.id] && $courseGrades[course.id]?.requirementId === req.id
								)
								.reduce((acc, c) => acc + c.credits, 0) >= req.credits}>Add A Course</Button.Root
						>
					{/if}
				</Card.Header>
				<Card.Content class="px-0">
					<ul class="divide-y-2">
						{#each req.details.filter((course) => {
							if (req.type === 'POOL') {
								return $courseGrades[course.id] && $courseGrades[course.id]?.requirementId === req.id;
							}
							return true;
						}) as course}
							<Course
								{course}
								required={req.type === 'POOL' ? false : true}
								requirementId={req.id}
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
								{@const index = degree.requirements.findIndex((r) => r.id === $dialogRequirementID)}
								{@const requirement = degree.requirements[index]}
								{#if requirement}
									{#each requirement.details.filter((course) => !$courseGrades[course.id] && !$requiredCourses
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
								addCourse(selectedCourseId);
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
										requirementId: $dialogRequirementID ?? ''
									};
								} else {
									$courseGrades[$selectedCourse.value?.id] = {
										grade: [selectedGrade.value],
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
{:catch error}
	<p>{error.message}</p>
{/await}
