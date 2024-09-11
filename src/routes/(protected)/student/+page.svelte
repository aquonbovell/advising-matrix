<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { gradePoints, type Grade } from '$lib/types';
	import { onMount } from 'svelte';
	import Course from './Course.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import Reload from 'svelte-radix/Reload.svelte';
	let addCourseDialog = false;
	let addGradeDialog = false;
	import * as Select from '$lib/components/ui/select';
	import {
		completedCourses,
		completedCredits,
		courseGrades,
		courses,
		dialogRequirementID,
		outstandingCourses,
		pendingCourses,
		requiredCourses,
		selectedCourse,
		totalCourses,
		totalCredits
	} from './store';
	import type { Selected } from 'bits-ui';
	import { Progress } from '$lib/components/ui/progress';
	import { notifications } from '$lib/stores/notifications';

	type CourseWithPrerequisites = {
		id: number;
		code: string;
		name: string;
		level: number;
		credits: number;
		departmentId: string;
		prequisites: Course[];
	};

	type Requirement = {
		majorId: string;
		id: string;
		type: 'CREDITS' | 'POOL';
		credits: number;
		details: CourseWithPrerequisites[];
		level: number | null;
	};

	type Course = {
		id: number;
		code: string;
		name: string;
		level: number;
		credits: number;
		departmentId: string;
	};

	type Degree = {
		name: string;
		majorId: string[];
		requirements: Requirement[];
	};

	export let data: PageData;

	async function getDegree(majorId: string, minorId: string): Promise<Degree> {
		const res = await fetch(`/api/degree/${majorId}x${minorId}`);
		let content: Degree = await res.json();
		const sortedRequirements = content.requirements.sort((a, b) => {
			const typeOrder = (a.type === 'CREDITS' ? -1 : 1) - (b.type === 'CREDITS' ? -1 : 1);
			if (typeOrder !== 0) return typeOrder;

			// If types are the same, sort by level in descending order
			return a.level! - b.level!;
		});
		content.requirements = sortedRequirements;
		return content;
	}

	async function getCourses() {
		const res = await fetch(`/api/student/${data.user?.id}/courses`);
		const content: {
			grades: string[];
			courseId: number | null;
			credits: number;
			id: string;
			requirementId: string | null;
		}[] = await res.json();
		return content;
	}

	$: ({ major_id, minor_id } = data.program);

	onMount(async () => {
		const degree = await getDegree(major_id, minor_id);
		const studentCourses = await getCourses();

		const coursesDB = degree.requirements
			.flatMap((req) => req.details)
			.map((course) => {
				return { id: course.id, credits: course.credits };
			});

		courses.set(coursesDB);

		studentCourses.forEach((course) => {
			const courseGrade = <Record<string, { requirementId: string; grade: Grade[] }>>{};
			courseGrade[course.courseId!] = {
				grade: course.grades as Grade[],
				requirementId: course.requirementId!
			};
			courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
		});

		const requiredCoursesDegree = degree.requirements
			.filter((req) => req.type === 'CREDITS')
			.flatMap((req) => req.details)
			.map((course) => {
				return { id: course.id, credits: course.credits };
			});

		let totalDegreeCredits = 0;
		let totalDegreeCourses = 0;

		degree.requirements.forEach((req) => {
			totalDegreeCredits += req.credits;
			totalDegreeCourses += req.credits / 3;
		});

		totalCredits.set(totalDegreeCredits);
		totalCourses.set(totalDegreeCourses);

		requiredCourses.update((courses) => [...courses, ...requiredCoursesDegree]);
	});

	function openGradeDialog() {
		addGradeDialog = true;
	}

	function addCourse(selectedCourseId: Selected<number>) {
		const courseGrade = <Record<string, { requirementId: string; grade: Grade[] }>>{};
		courseGrade[selectedCourseId.value!] = {
			grade: [] as Grade[],
			requirementId: $dialogRequirementID!
		};
		courseGrades.update((grades) => ({ ...grades, ...courseGrade }));
		selectedCourseId = {
			value: 0,
			label: ''
		};
	}

	async function saveGrades() {
		const respone = await fetch(`/api/student/${data.user?.id}/grades`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ grades: $courseGrades })
		});

		const content = await respone.json();

		if (content.status === 200) {
			alert('Grades saved successfully');
			notifications.info('Grades saved successfully', 5000);
		} else if (content.status === 404) {
			alert(content.message);
			notifications.info(content.message, 5000);
		} else {
			alert('An error occurred');
			notifications.info('An error occurred. Try again later', 5000);
		}
	}

	let selectedCourseId: Selected<number>;
	let selectedGrade: Selected<Grade>;

	let loading = false;
</script>

{#await getDegree(major_id, minor_id)}
	<p>loading...</p>
{:then degree}
	<div class="flex flex-col gap-6">
		<Card.Root>
			<Card.Header class="flex flex-row items-baseline justify-between">
				<Card.Title>{`${degree.name}`}</Card.Title>
				<Button
					variant="outline"
					disabled={loading}
					on:click={async () => {
						loading = true;
						await saveGrades();
						loading = false;
					}}
					>{#if loading}<Reload class="mr-2 h-4 w-4 animate-spin" />{/if}Save Changes</Button
				>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-3">
					<div class="flex flex-wrap gap-3">
						<Button variant="outline">All Courses</Button>
						<Button variant="outline">Completed Courses ({$completedCourses})</Button>
						<Button variant="outline">Pending Courses ({$pendingCourses})</Button>
						<Button variant="outline">Outstanding Courses ({$outstandingCourses})</Button>
					</div>
					<div class="grid grid-cols-[1fr_110px] items-center gap-4">
						<Progress value={$completedCredits} max={$totalCredits} />
						<p class="block w-fit">{$completedCredits} / {$totalCredits} Credits</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
		{#each degree.requirements as req}
			<Card.Root>
				<Card.Header class="flex flex-row items-baseline justify-between">
					<Card.Title
						>{`Level ${req.level === 4 ? '2 / 3' : req.level} - ${req.credits} ${req.type === 'POOL' ? 'Elective' : 'Required'}`}</Card.Title
					>
					{#if req.type === 'POOL'}
						<Button
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
								.reduce((acc, c) => acc + c.credits, 0) >= req.credits}>Add A Course</Button
						>
					{/if}
				</Card.Header>
				<Card.Content>
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
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<Dialog.Root bind:open={addCourseDialog}>
		<Dialog.Trigger />
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
					<div class="flex gap-3">
						<Select.Root
							required={true}
							selected={selectedCourseId}
							onSelectedChange={(value) => {
								value && (selectedCourseId = value);
							}}
						>
							<Select.Trigger class="w-[350px]">
								<Select.Value placeholder="Select A course" />
							</Select.Trigger>
							<Select.Content class=" max-h-[18rem] overflow-y-auto">
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
								selectedCourseId = {
									value: 0,
									label: ''
								};
							}}
							class="active:scale-98 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>Add Course</Dialog.Close
						>
					</div>
				</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={addGradeDialog}>
		<Dialog.Trigger />
		<Dialog.Content>
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
							<Select.Trigger class="w-[350px]">
								<Select.Value placeholder="Enter Grade" />
							</Select.Trigger>
							<Select.Content class=" max-h-[18rem] overflow-y-auto">
								{#each Object.keys(gradePoints) as grade}
									<Select.Item value={grade}>{grade}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Dialog.Close
							on:click={() => {
								if ($selectedCourse.value?.id === undefined) return;
								const course = $courseGrades[$selectedCourse.value?.id];

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

								addGradeDialog = false;
							}}
							class="active:scale-98 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>Add Course</Dialog.Close
						>
					</div>
				</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
{:catch error}
	<p>{error.message}</p>
{/await}
