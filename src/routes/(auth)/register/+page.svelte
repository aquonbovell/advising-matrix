<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1>Complete Registration</h1>

<form method="POST" use:enhance>
	<input type="hidden" name="token" value={data.token} />
	<label for="password">Set Your Password:</label>
	<input type="password" id="password" name="password" required />
	<button type="submit">Complete Registration</button>
</form>

<!-- {#if form?.success}
	<p>
		Registration completed successfully! You can now <a href="/login">login</a>.
	</p>
{/if} -->

{#if form?.error}
	<p>{form.error}</p>
{/if}
