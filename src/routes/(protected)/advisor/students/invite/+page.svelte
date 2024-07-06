<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1>Invite Student</h1>

<form method="POST" use:enhance>
	<label for="email">Student Email:</label>
	<input type="email" id="email" name="email" required />
	<button type="submit">Send Invitation</button>
</form>

{#if form?.success}
	<p>Invitation sent successfully!</p>
{/if}

{#if form?.error}
	<p>{form.error}</p>
{/if}
