<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
	import RegisterForm from './register-form.svelte';
	import AccessInfo from '$lib/components/auth/access-info.svelte';

	export let data: PageData;
</script>

{#if data.token}
	<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
		<Card.Header>
			<img src={'/uwi_banner.png'} alt="UWI Banner" />
			<Card.Title class="text-2xl">Complete Registration</Card.Title>
			<Card.Description>Enter your token and email to set your account password.</Card.Description>
		</Card.Header>
		<Card.Content>
			<RegisterForm data={data.form} />
		</Card.Content>
		<Card.Footer class=" mt-4 justify-around text-center text-sm text-gray-600">
			<p>
				Need access? <Button.Root href="/access" variant="link">Request here</Button.Root>
			</p>
		</Card.Footer>
	</Card.Root>
{:else}
	<AccessInfo />
{/if}
