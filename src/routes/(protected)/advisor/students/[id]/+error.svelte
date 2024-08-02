<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error?.message}</h1>

{#if $page.status === 403}
	<p>You cannot view anyone that is not a student.</p>
	<a href="/">HOME</a>
{/if}
