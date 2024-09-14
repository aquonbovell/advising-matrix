<script lang="ts">
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import LoginForm from './login-form.svelte';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';

	export let data: PageData;
</script>

<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
	<Card.Header>
		<img src={uwiBanner} alt="UWI Banner" />
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account.</Card.Description>
	</Card.Header>
	<Card.Content>
		<LoginForm data={data.form} />
	</Card.Content>
</Card.Root>
