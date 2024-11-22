<script lang="ts">
	import { type Grade, type Program } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import { Progress } from '$lib/components/ui/progress';
	import { fly } from 'svelte/transition';
	import Course from './course.svelte';
	import {
		degree,
		studentCourses as studentGrades,
		degreeGPA,
		overallGPA,
		totalCredits,
		completedCredits
	} from '$lib/stores/matrix';

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
		}[];
		userId: string;
	} = $props();

	let addCourseDialog = $state(false);
	let addGradeDialog = $state(false);
	let selectedCourseId = $state<string[]>([]);
	let dialogRequirementID = $state<string>('');

	degree.set(data);
	studentGrades.set(studentCourses);

	function openGradeDialog() {
		addGradeDialog = true;
	}

	function openSuggestionsDialog(id: string) {
		addCourseDialog = true;
		dialogRequirementID = id;
		selectedCourseId = $studentGrades
			.filter((sg) => sg.requirementId === id)
			.map((sg) => sg.courseId);
	}

	type StudentRecord = {
		requirementId: string;
		grade: Grade[];
		userId: string | null;
		name: string | null;
	};

	function addCourse(selectedCourseIds: string[], userId: string | null) {
		const requirementIndex = data.requirements.findIndex((r) => r.id === dialogRequirementID);
		console.log(requirementIndex);

		if (requirementIndex === -1) {
			return;
		}

		if (selectedCourseIds.length === 0) {
			return;
		}
		let credits = 0;

		const requirement = data.requirements[requirementIndex];
		for (let courseId of selectedCourseIds) {
			const course = requirement.courses.find((c) => c.id === courseId);
			console.log(course);

			if (!course) {
				return;
			}

			if (credits >= requirement.credits) {
				break;
			}

			credits += course.credits;

			studentGrades.update((grades) => [
				...grades,
				{
					id: crypto.randomUUID(),
					studentId: userId,
					grade: '',
					requirementId: dialogRequirementID,
					courseId: courseId,
					userId: userId
				}
			]);
		}

		selectedCourseId = [];
	}

	// // async function handleSave(id: string) {
	// // 	const formData = new FormData();
	// // 	if (role !== 'STUDENT') {
	// // 		const studentCourses: Record<
	// // 			string,
	// // 			{
	// // 				requirementId: string;
	// // 				grade: Grade[];
	// // 				userId: string | null;
	// // 			}
	// // 		> = {};
	// // 		Object.entries($courseGrades).forEach(([courseId, courseData]) => {
	// // 			if (courseData.userId === userId) {
	// // 				studentCourses[courseId] = {
	// // 					grade: courseData.grade as Grade[],
	// // 					requirementId: courseData.requirementId!,
	// // 					userId: courseData.userId
	// // 				};
	// // 			}
	// // 		});
	// // 		formData.append('grades', JSON.stringify(studentCourses));
	// // 		formData.append('studentId', id);
	// // 	} else {
	// // 		formData.append('grades', JSON.stringify($courseGrades));
	// // 		formData.append('studentId', id);
	// // 	}
	// // 	const response = await fetch(`?/save`, {
	// // 		method: 'POST',
	// // 		body: formData
	// // 	});

	// // 	const result: ActionResult = deserialize(await response.text());

	// // 	alert(result.status);

	// // 	if (result.status === 200) {
	// // 		toastState.add('Notice', 'Grades saved successfully', 'success');
	// // 	} else if (result.status === 400) {
	// // 		toastState.add('Error', 'result.data', 'error');
	// // 	} else if (result.status === 404) {
	// // 		toastState.add('Error', 'result.data', 'error');
	// // 	} else {
	// // 		toastState.add('Error', 'An error occurred while saving grades', 'error');
	// // 	}

	// // 	return;
	// // }
</script>

<div class="mx-auto flex flex-col gap-5" transition:fly={{ y: 30, delay: 200 }}>
	<!-- Degree Info -->
	<Card.Root class="min-w-80">
		<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
			<Card.Title>{data.name}</Card.Title>
			<Button.Root variant="outline">
				<!-- {#if loading}  -->
				<!-- <Reload class="mr-2 h-4 w-4 animate-spin" /> -->
				<!-- {/if} -->
				<!-- {#if role !== 'STUDENT'} -->
				Save Suggestions
				<!-- on:click={async () => {
            loading = true;
            await handleSave(student.id);
            loading = false;
          }} -->
				<!-- {:else}
					Save Changes
				{/if} -->
			</Button.Root>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3 px-4 py-3 ">
			<div class="flex flex-wrap gap-3">
				<Button.Root variant="ghost" type="button">Degree GPA: {$degreeGPA}</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA: {$overallGPA}</Button.Root>
				<Button.Root variant="outline">Completed Courses ({5})</Button.Root>
			</div>
			<!-- Courses Statistics -->
			<div class="flex flex-col gap-3">
				<div class="flex flex-wrap gap-3">
					<Button.Root variant="outline">All Courses</Button.Root>
					<!-- <Button.Root variant="outline">Outstanding Courses ({$outstandingCourses})</Button.Root>
					<Button.Root variant="outline">Pending Courses ({$pendingCourses})</Button.Root> -->
				</div>
			</div>
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
				<Progress value={$completedCredits} max={$totalCredits} class="h-3" />
				<p class="w-fit">{$completedCredits} / {$totalCredits} Credits</p>
			</div>
		</Card.Content>
	</Card.Root>
	<!-- Degree Requirements -->
	{#each data.requirements as req}
		<Card.Root class="min-w-80">
			<Card.Header class="flex flex-row items-baseline justify-between px-4 py-3 ">
				<Card.Title>Level {req.level.join(', ')} {req.option} - {req.credits} credits</Card.Title>
				{#if req.option === 'AT MOST' || req.option === 'AT LEAST'}
					<Button.Root
						class="!m-0"
						variant="outline"
						disabled={false}
						onclick={() => openSuggestionsDialog(req.id)}
					>
						Add Suggestion
					</Button.Root>
				{/if}
			</Card.Header>
			<Card.Content class="p-0">
				<ul class="grid md:grid-cols-2">
					{#each req.courses as course}
						{@const isInStudentCourses = $studentGrades.some(
							(sc) => sc.courseId === course.id && sc.requirementId === req.id
						)}
						{#if req.option === 'ALL' || isInStudentCourses}
							<Course
								{course}
								required={req.option === 'ALL'}
								requirementId={req.id}
								role={'ADMIN'}
								addGradeDialog={openGradeDialog}
							/>
						{/if}
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
<Dialog.Root bind:open={addCourseDialog}>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>Select a course</Dialog.Title>
			<Dialog.Description>
				<p class="pb-4">
					Select a course from the list below to add. The course will be added to your list of
					courses.
				</p>
				<div class="flex flex-col gap-3 md:flex-row">
					<Select.Root required={true} type="multiple" bind:value={selectedCourseId}>
						<Select.Trigger class="w-72 md:w-80">
							{@const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#if requirement.courses.filter( (course) => selectedCourseId.includes(course.id) ).length > 0}
									{requirement.courses
										.filter((course) => selectedCourseId.includes(course.id))
										.map((c) => c.name)
										.join(', ')}
								{:else}
									Select a course
								{/if}
							{:else}
								Select a course
							{/if}
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{@const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#each requirement.courses.filter((course) => !$studentGrades.some((sg) => sg.courseId === course.id)) as course}
									<Select.Item value={course.id}>{course.code} - {course.name}</Select.Item>
								{/each}
							{:else}
								<Select.Item value="No courses found" disabled>No courses found</Select.Item>
							{/if}
						</Select.Content>
					</Select.Root>
					<Dialog.Close
						onclick={() => {
							addCourse(selectedCourseId, userId);
							addCourseDialog = false;
						}}><Button.Root>Add Course</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
