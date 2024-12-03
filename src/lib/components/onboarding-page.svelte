<script lang="ts">
	import type { OnboardingSchema } from '$lib/schemas/onboarding';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import OnboardingForm from '$lib/components/onboarding-form.svelte';

	let { form }: { form: SuperValidated<Infer<OnboardingSchema>> } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<OnboardingForm {form} />
</div>
