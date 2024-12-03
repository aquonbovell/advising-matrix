<script lang="ts">
	import type { PageData } from './$types';
	import OnboardingPage from '$lib/components/onboarding-page.svelte';

	let { data }: { data: PageData } = $props();
</script>

<OnboardingPage form={data.form} />
