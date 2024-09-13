<script lang="ts">
	import { Access } from '$lib/components/auth';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import type { ActionData, PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import RegisterForm from './register-form.svelte';

	export let data: PageData;
</script>

{#if data.token}
	<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
		<Card.Header>
			<img src={uwiBanner} alt="UWI Banner" />
			<Card.Title class="text-2xl">Complete Registration</Card.Title>
			<Card.Description>Enter your token and email to set your account password.</Card.Description>
		</Card.Header>
		<Card.Content>
			<RegisterForm data={data.form} />
		</Card.Content>
		<Card.Footer class=" mt-4 justify-around text-center text-sm text-gray-600">
			<p>
				Need access? <a href="/access" class="font-medium text-muted-foreground hover:underline">
					Request here</a
				>
			</p>
		</Card.Footer>
	</Card.Root>
{:else}
	<Access />
{/if}
