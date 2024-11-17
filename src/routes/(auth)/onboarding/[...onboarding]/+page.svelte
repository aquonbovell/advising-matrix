<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import Onboarding from './onboarding.form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
	<Card.Header class="flex flex-col items-center text-center">
		<img src={'/banner.png'} alt="UWI Banner" />
		<Card.Title class="text-2xl">Onboarding</Card.Title>
		<Card.Description>Enter your account details to set up your account.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Onboarding data={data.form} />
	</Card.Content>
</Card.Root>
