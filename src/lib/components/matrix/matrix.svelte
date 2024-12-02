<script lang="ts">
	import { type Grade, type Program } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Progress } from '$lib/components/ui/progress';
	import { fly } from 'svelte/transition';
	import Course from './course.svelte';
	import {
		degree,
		studentCourses as studentGrades,
		degreeGPA,
		overallGPA,
		totalCredits,
		completedCredits,
		completedCourses
	} from '$lib/stores/matrix';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { applyAction, enhance } from '$app/forms';

	const { id } = $page.params;

	let {
		studentDegree,
		studentCourses,
		userId
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
	} = $props();

	let isOpen = $state(false);
	let selectedCourses = $state<string[]>([]);
	let dialogRequirementID = $state<string>('');
	degree.set(studentDegree);
	studentGrades.set(studentCourses.map((sc) => ({ ...sc, grade: sc.grade })));

	function openSuggestionsDialog(id: string) {
		isOpen = true;
		dialogRequirementID = id;
		selectedCourses = $studentGrades
			.filter((sg) => sg.requirementId === id)
			.map((sg) => sg.courseId);
	}

	function addCourse(selectedCourseIds: string[], userId: string | null) {
		if (selectedCourseIds.length === 0) {
			toast.info('No courses were added');
			return;
		}
		selectedCourseIds.forEach((courseId) => {
			studentGrades.update((grades) => [
				...grades,
				{
					id: crypto.randomUUID(),
					grade: [],
					requirementId: dialogRequirementID,
					courseId: courseId,
					userId: userId,
					name: ''
				}
			]);
		});
		toast.success('Suggestions saved successfully');
	}
</script>

<div class="mx-auto mb-4 flex flex-col gap-5" transition:fly={{ y: 30, delay: 200 }}>
	<!-- Degree Info -->
	<Card.Root class="min-w-80">
		<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
			<Card.Title>{studentDegree.studentName} - Bsc. {studentDegree.name}</Card.Title>
			<form
				action="?/saveSuggestions"
				method="post"
				use:enhance={() => {
					return async ({ result }) => {
						// `result` is an `ActionResult` object
						if (result.type === 'failure') {
							toast.error(result.data?.message as string, { duration: 2000 });
						} else if (result.type === 'success') {
							isOpen = false;
							toast.success('Course deleted successfully', { duration: 2000 });
						} else {
							isOpen = false;
							toast.error('An error occurred', { duration: 2000 });
						}
						await applyAction(result);
					};
				}}
			>
				<label for="studentId" hidden
					>StudentId
					<input type="text" name="studentId" id="studentId" value={id} />
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
				<Button.Root type="submit" variant="outline">Save Suggestions</Button.Root>
			</form>
			<!-- <Button.Root variant="outline">
				<!-- {#if loading}  -->
			<!-- <Reload class="mr-2 h-4 w-4 animate-spin" /> -->
			<!-- {/if} -->
			<!-- {#if role !== 'STUDENT'} -->
			<!-- Save Suggestions -->
			<!-- on:click={async () => {
            loading = true;
            await handleSave(student.id);
            loading = false;
          }} -->
			<!-- {:else}
					Save Changes
				{/if}
			</Button.Root> -->
		</Card.Header>
		<Card.Content class="flex flex-col gap-3 px-4 py-3 ">
			<div class="flex flex-wrap gap-3">
				<Button.Root variant="ghost" type="button">Degree GPA: {$degreeGPA}</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA: {$overallGPA}</Button.Root>
				<Button.Root variant="outline">Completed Courses ({$completedCourses.length})</Button.Root>
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
	{#each studentDegree.requirements as req}
		<Card.Root class="min-w-80">
			<Card.Header class="flex flex-row items-baseline justify-between px-4 py-3 ">
				<Card.Title class="text-base">
					{#if req.level.length > 1}
						Electives
					{:else}
						Level {req.level.join(', ')}
					{/if}
					{req.option.toLocaleLowerCase()} - {req.credits} credits from the following</Card.Title
				>
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
						{@const isInStudentCourses = $studentGrades.findIndex(
							(sc) => sc.courseId === course.id && sc.requirementId === req.id
						)}
						{#if req.option === 'ALL' || isInStudentCourses !== -1}
							<!-- <pre>{JSON.stringify(course, null, 2)}</pre> -->

							<!-- requirementId={req.id} -->
							<!-- addGradeDialog={openGradeDialog} -->
							<Course {course} required={req.option === 'ALL'} role={'ADMIN'} />
						{/if}
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="max-w-min">
		<Dialog.Header>
			<Dialog.Title>Select courses to suggest</Dialog.Title>
			<Dialog.Description>
				<p class="pb-4">
					Select from the list below to add. The course will be added to the student's matrix to
					then accept or reject.
				</p>
				<div class="flex flex-col gap-3 md:flex-row">
					<Select.Root
						required={true}
						type="multiple"
						bind:value={selectedCourses}
						onValueChange={(value) => {
							const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID);
							const requirement = $degree.requirements[index];
							const validSelections: string[] = [];

							let credits = 0;

							for (let courseId of value) {
								const course = requirement.courses.find((c) => c.id === courseId);

								if (!course) {
									continue;
								}

								if (credits >= requirement.credits) {
									break;
								}

								credits += course.credits;
								validSelections.push(course.id);
							}

							selectedCourses = validSelections;
						}}
					>
						<Select.Trigger class="flex h-fit w-72 flex-wrap justify-start gap-3 md:w-80">
							{@const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#if requirement.courses.filter( (course) => selectedCourses.includes(course.id) ).length > 0}
									{#each requirement.courses
										.filter((course) => selectedCourses.includes(course.id))
										.map((c) => c.name) as selectedCourse}
										<Badge>{selectedCourse}</Badge>
									{/each}
								{:else}
									Select a course
								{/if}
							{:else}
								No courses found
							{/if}
						</Select.Trigger>
						<Select.Content class=" max-h-60 overflow-y-auto">
							{@const index = $degree.requirements.findIndex((r) => r.id === dialogRequirementID)}
							{@const requirement = $degree.requirements[index]}
							{#if requirement}
								{#each requirement.courses
									.filter((c) => !$studentGrades.some((sg) => sg.courseId === c.id) && !$degree.requirements
												.filter((r) => r.option === 'ALL')
												.some((r) => r.details.some((detail) => detail === c.id)))
									.sort((a, b) => {
										if (a.code < b.code) {
											return -1;
										}
										if (a.code > b.code) {
											return 1;
										}
										return 0;
									}) as course}
									<Select.Item value={course.id}>{course.code} - {course.name}</Select.Item>
								{/each}
							{:else}
								<Select.Item value="No courses found" disabled>No courses found</Select.Item>
							{/if}
						</Select.Content>
					</Select.Root>
					<Dialog.Close
						onclick={() => {
							addCourse(selectedCourses, userId);
							isOpen = false;
						}}><Button.Root>Add Suggestions</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
