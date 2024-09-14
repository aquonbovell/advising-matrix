<script lang="ts">
	import type { PageData } from './$types';
	import StudentChart from '$lib/components/matrix/StudentChart.svelte';
	export let data: PageData;
	import { page } from '$app/stores';

	async function handleEmail(event: MouseEvent) {
		const form = new FormData();

		form.append('email', 'aquon_bovell@outlook.com');
		form.append('alternate', 'aquon.bovell@mycavehill.uwi.edu');
		form.append('token', '1543264');
		form.append('url', '1543264');

		const res = await fetch('/api/sendemail', {
			method: 'POST',
			body: form
		});

		const data = await res.json();

		console.log(data);
	}
</script>

<h1>Dashboard</h1>
<button on:click={handleEmail}>Post</button>
<StudentChart studentId={data.studentId} />
