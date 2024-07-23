<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import Loading from '$lib/components/ui/Loading.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import type { Course } from '$lib/db/schema';
	import {
		gradePoints,
		type CourseRequirement,
		type Grade,
		type ProgramRequirement
	} from '$lib/types';
	import { writable } from 'svelte/store';

	let user = $page.data.user;
	let program = $page.data.program;
	let programCourses: Course[] = $page.data.programCourses;
	let requirement = program.requirement as ProgramRequirement;

	let currentTerm = 'Spring 2024 (Current)';
	let degree = {
		name: ['BSc Computer Science', 'BSc Mathematics'],
		minor: 'N/A',
		classification: 'Level III/Third Year',
		gpa: 1.9
	};

	const courseGradesStore = writable<Record<string, Grade>>({});

	function updateGrade(courseId: string, grade: Grade) {
		courseGradesStore.update((grades) => ({ ...grades, [courseId]: grade }));
	}

	function handleGradeChange(courseId: string, event: Event) {
		const target = event.target as HTMLSelectElement;
		const grade = target.value as Grade;
		updateGrade(courseId, grade);
	}

	let totalCredits = 114;
	let appliedCredits = 90;
	let stillNeeded = 8;
	let inProgress = 5;
	let complete = 30;

	$: gpa = calculateGPA($courseGradesStore);
	$: progressPercentage = (appliedCredits / totalCredits) * 100;

	function calculateGPA(grades: Record<string, Grade>) {
		let totalPoints = 0;
		let totalCredits = 0;

		programCourses.forEach((course) => {
			const grade = grades[course.id];
			if (grade !== null && grade !== undefined) {
				totalPoints += gradePoints[grade] * course.credits;
				totalCredits += course.credits;
			}
		});

		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	}
</script>

<div class="mt-6 overflow-hidden">
	<div class="flex flex-wrap items-start gap-x-12 px-4 py-2 text-sm">
		<div class="flex min-w-[200px] flex-col items-start">
			<span class="uppercase text-gray-500">Current Degree(S)</span>
			<div class="font-semibold">
				{#each degree.name as name}
					<div>{name}</div>
				{/each}
			</div>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Minor</span>
			<span class="font-semibold">{degree.minor}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Classification</span>
			<span class="font-semibold">{degree.classification}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Overall Gpa</span>
			<span class="font-semibold">{degree.gpa}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Academic Standing</span>
			{#if degree.gpa < 2.0}
				<span class="font-semibold text-red-500">Academic Warning</span>
			{:else}
				<span class="font-semibold">Good Standing</span>
			{/if}
		</div>
	</div>
</div>

<h2 class="mb-4 text-xl font-semibold">Course Requirements</h2>

<div class="flex flex-wrap items-center justify-between gap-y-2">
	<div class="flex flex-wrap items-center gap-2">
		<Button>All Courses</Button>
		<button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
			<svg
				class="mr-1 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				></path>
			</svg>
			Still Needed ({stillNeeded})
		</button>
		<button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
			<svg
				class="mr-1 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			In Progress ({inProgress})
		</button>
		<button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
			<svg
				class="mr-1 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
				></path>
			</svg>
			Complete ({complete})
		</button>
	</div>

	<div class="flex flex-col items-end">
		<div class="mb-1 text-sm text-gray-600">
			{appliedCredits}/{totalCredits} Credits Applied
		</div>
		<div class="w-48">
			<ProgressBar progress={progressPercentage} size="sm" />
		</div>
	</div>
</div>

<h1 class="mb-6 text-2xl font-bold">Courses for {program.name}</h1>

<div class="space-y-4">
	{#each programCourses as course (course.id)}
		<div class="rounded-lg border border-gray-200 p-4 shadow-sm">
			<h3 class="text-lg font-semibold">{course.code} - {course.name}</h3>
			<p class="mt-1 text-sm text-gray-600">Level: {course.level}</p>
			<p class="text-sm text-gray-600">Credits: {course.credits}</p>
			<div class="mt-2">
				<label for={`grade-${course.id}`} class="mr-2">Grade:</label>
				<select
					id={`grade-${course.id}`}
					on:change={(e) => handleGradeChange(course.id, e)}
					class="rounded border p-1"
				>
					<option value={null}>Select Grade</option>
					{#each Object.keys(gradePoints) as grade}
						<option value={grade}>{grade}</option>
					{/each}
				</select>
			</div>
		</div>
	{/each}
</div>

{#if programCourses.length === 0}
	<p class="mt-4 text-gray-600">No courses found for this program.</p>
{/if}

<div class="mt-6 text-xl font-bold">
	Overall GPA: {gpa}
</div>

<!-- <div class="overflow-hidden border">
	<div class="flex items-center justify-between border-l-4 border-red-600 p-4">
		<div class="flex items-center space-x-2">
			<svg
				class="flex size-5 flex-shrink-0 text-red-600"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path
					d="M12 9v4"
				/><path d="M12 17h.01" /></svg
			>
			<span class="font-semibold">{requirement.name}</span>
			<span class="pl-6 text-sm text-gray-600"
				>{requirement.remainingCredits} Credits Remaining</span
			>
		</div>
		<div class="text-sm text-gray-600">
			{requirement.appliedCredits}/{requirement.totalCredits} Credits Applied
		</div>
	</div>
</div> -->
