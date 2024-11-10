<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { site } from '$lib/utils';
</script>

<svelte:head>
	<title>{site}: Admin Dashboard</title>
</svelte:head>

<h1 class="text-xl font-bold">Admin Dashboard of Advising Matrix</h1>

<h2>Quick Links</h2>
<div class="my-1 flex gap-6">
	<Button href="/admin/users">Users</Button>
	<Button href="/admin/students">Students</Button>
	<Button href="/admin/courses">Courses</Button>
</div>
