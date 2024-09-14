<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { CourseManager } from './matrix-state.svelte';
	import { onMount } from 'svelte';
	import Reload from 'svelte-radix/Reload.svelte';
	import type { Selected } from 'bits-ui';
	import type { Grade } from '$lib/types';
	import Course from './Course.svelte';
	import { Progress } from '$lib/components/ui/progress';

	export let major_id: string;
	export let minor_id: string;
	export let id: string;

	let addCourseDialog = false;
	let addGradeDialog = false;

	let selectedCourseId: Selected<number>;
	let selectedGrade: Selected<Grade>;

	let courseManager = new CourseManager();

	$: requirements = courseManager.requirements;
	// $: completedCredits = courseManager.completedCredits;
	$: totalCredits = courseManager.totalCredits;

	$: dialogRequirementID = courseManager.dialogRequirementID;

	function openGradeDialog() {
		addGradeDialog = true;
	}
	let gpa: number = 0;
	let degreeGPA: number = 0;
	courseManager.calculateGPA().subscribe((value) => {
		gpa = value;
	});

	onMount(async () => {
		await courseManager.initializeCourses(major_id, minor_id, id);
	});
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6">
	<!-- Degree Info -->
	<Card.Root>
		<Card.Header class="flex flex-row items-baseline justify-between">
			<Card.Title>{'degree.name'}</Card.Title>
			<Card.Title>{$dialogRequirementID}</Card.Title>
			<Button.Root variant="outline"
				><Reload class="mr-2 h-4 w-4 animate-spin" />Save Changes</Button.Root
			>
		</Card.Header>
		<Card.Content>
			<div class="flex gap-3 pb-4">
				<Button.Root variant="ghost" type="button">Degree GPA: {degreeGPA}</Button.Root>
				<Button.Root variant="ghost" type="button">Overall GPA: {gpa}</Button.Root>
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
				<Progress value={$totalCredits / 5} max={$totalCredits} class="h-3" />
				<p class="w-fit">{$totalCredits / 5} / {$totalCredits} Credits</p>
			</div>
		</Card.Content>
	</Card.Root>
	<!-- Degree Requirements -->
	{#each $requirements as req}
		<Card.Root>
			<Card.Header class="flex flex-row items-baseline justify-between">
				<Card.Title
					>{`Level ${req.level === 4 ? '2 / 3' : req.level} - ${req.credits} credits`}</Card.Title
				>
				{#if req.type === 'POOL'}
					<Button.Root
						variant="outline"
						on:click={() => {
							courseManager.dialogRequirementID.set(req.id);

							addCourseDialog = true;
						}}>Add A Course</Button.Root
					>
				{/if}
			</Card.Header>
			<Card.Content class="px-0">
				<ul class="divide-y-2">
					{#if req.id}
						{@const courses = courseManager.getRequirementDetails(req.id)}
						{#each courses as course}
							<Course
								{course}
								required={req.type === 'POOL' ? false : true}
								requirementId={req.id}
								addGradeDialog={openGradeDialog}
							/>
						{/each}
					{/if}
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
							{#if $dialogRequirementID}
								{#each courseManager.getDialogCourses($dialogRequirementID) as course}
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
							courseManager.addCourse(selectedCourseId, $dialogRequirementID);
						}}><Button.Root>Add Course</Button.Root></Dialog.Close
					>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
