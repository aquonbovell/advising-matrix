<script lang="ts">
	import type { PageData } from './$types';
	import Testcomp from './Testcomp.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Testcomp studentDegree={data.degree} studentCourses={data.studentCourses} userId={data.user.id} />
