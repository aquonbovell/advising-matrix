<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<h1>Dashboard</h1>
<p>Welcome to Advising Matrix!</p>

<h2>Quick Links</h2>
<div class="my-1 flex gap-6">
	<Button href="/admin/users" variant="default" class="w-max">Users</Button>
	<Button href="/admin/courses" variant="default" class="w-max">Courses</Button>
</div>
