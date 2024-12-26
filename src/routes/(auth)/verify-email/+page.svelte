<script lang="ts">
	import VerifyEmailForm from '$lib/components/verify-email-form.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<VerifyEmailForm {data} {form} />
</div>
