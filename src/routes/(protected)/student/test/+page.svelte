<script lang="ts">
	import CourseTree from '$lib/components/coursetree/CourseTree.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let id: string;

	$: course = data.courses.find((course) => course.id === id);
</script>

<select bind:value={id}>
	{#each data.courses as course}
		<option value={course.id}>{course.name}</option>
	{/each}
</select>
{#if data.courses.find((course) => course.id === id)}
	<CourseTree course={data.courses.find((course) => course.id === id)} />
{/if}
