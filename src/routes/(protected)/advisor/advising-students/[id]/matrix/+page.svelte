<script lang="ts">
	import type { PageData } from './$types';
	import StudentData from '$lib/components/matrix/StudentData.svelte';
	export let data: PageData;
</script>

<StudentData
	student={data.student}
	degree={data.degree}
	studentCourses={data.studentCourses}
	role={data.user?.role}
	userId={data.userId}
/>
