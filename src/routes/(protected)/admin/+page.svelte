<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
</script>

<h1>Dashboard</h1>
<p>Welcome to Advising Matrix!</p>

<h2>Quick Links</h2>
<div class="my-1 flex gap-6">
	<Button href="/users" class="w-max">All Users</Button>
	<Button href="/admin/courses" class="w-max">Program Courses</Button>
</div>
