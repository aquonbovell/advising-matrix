<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { site } from '$lib/utils';
</script>

<svelte:head>
	<title>{site}: Advisor Dashboard</title>
</svelte:head>

<h1>Dashboard</h1>
<p>Welcome to Advising Matrix!</p>

<h2>Quick Links</h2>
<div class="my-1 flex gap-6">
	<Button href="/advisor/advising-students">Students</Button>
	<Button href="/advisor/courses">Courses</Button>
</div>
