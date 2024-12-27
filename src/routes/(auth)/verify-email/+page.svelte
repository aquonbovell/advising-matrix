<script lang="ts">
	import VerifyEmailForm from '$lib/components/verify-email-form.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<VerifyEmailForm {form} />
</div>
