<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Student {data.student.id}</h1>

<p>Student Name: {data.student.name}</p>
<p>Student Email: {data.student.email}</p>
<p>Student Role: {data.student.role}</p>
<p>Student created_at {data.student.created_at}</p>
<p>Student updated_at {data.student.updated_at}</p>
