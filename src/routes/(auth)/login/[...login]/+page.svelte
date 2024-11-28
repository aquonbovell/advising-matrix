<script lang="ts">
	import type { PageData } from './$types';
	import Login from './login.form.svelte';
	import * as Card from '$lib/components/ui/card';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="w-full max-w-md rounded-2xl bg-white px-4 shadow-lg">
	<Card.Header class="flex flex-col items-center text-center">
		<img src={'/banner.png'} alt="UWI Banner" />
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your credentials below to login to your account.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Login data={data.form} />
	</Card.Content>
</Card.Root>
