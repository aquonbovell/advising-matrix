<script lang="ts">
	import StudentData from '$lib/components/matrix/StudentData.svelte';
	import { trpc } from '$lib/trpc';
	import type { PageData } from './$types';
	import TestComp from './TestComp.svelte';

	export let data: PageData;

	$: courses = trpc.students.getStudentCourses.query();
	$: degree = trpc.students.getStudentDegree.query({
		majorId: data.program.major_id,
		minorId: data.program.minor_id
	});
	$: program = trpc.students.getStudentProgram.query();
</script>

{#if $courses.isLoading && $degree.isLoading && $program.isLoading}
	<p>Loading...</p>
{:else if $courses.isError}
	<p style="color: red">{$courses.error.message}</p>
{:else if $courses.data && $degree.data && $program.data}
	<!-- <StudentData studentCourses={$courses.data} degree={$degree.data} program={$program.data} /> -->
	<TestComp studentCourses={$courses.data} degree={$degree.data} program={$program.data} />
{/if}
