<script lang="ts">
	import LoginForm from '$lib/components/login-form.svelte';
	import type { LoginSchema } from '$lib/schemas/login';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';

	let { form }: { form: SuperValidated<Infer<LoginSchema>> } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm {form} />
</div>
