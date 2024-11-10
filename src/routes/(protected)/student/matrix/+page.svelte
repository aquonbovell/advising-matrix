<script lang="ts">
	import { trpc } from '$lib/trpc';
	import type { PageData } from './$types';
	import TestComp from './TestComp.svelte';

	export let data: PageData;

	$: courses = trpc.students.findStudentGrades.query({ studentId: data.student.id });
	$: degree = trpc.students.findStudent.query({
		majorId: data.student.major_id,
		minorId: data.student.minor_id
	});

	$: codes = trpc.students.findCodes.query();
</script>

<TestComp
	studentCourses={$courses.data || { courses: [] }}
	courseCodes={$codes.data || []}
	studentId={data.student.id}
	degree={$degree.data || { id: crypto.randomUUID(), name: 'None', requirements: [] }}
/>
