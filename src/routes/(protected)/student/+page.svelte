<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>{$page.data.user.role} Dashboard</h1>
<p>Welcome to Advising Matrix!</p>
<form method="POST" action="/logout">
	<button type="submit">Logout</button>
</form>
