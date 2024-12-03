<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { onboardingSchema, type OnboardingSchema } from '$lib/schemas/onboarding';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Loader from 'lucide-svelte/icons/loader';

	let { form: data }: { form: SuperValidated<Infer<OnboardingSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(onboardingSchema)
	});

	const { form: formData, enhance, submitting } = form;
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Onboarding</Card.Title>
		<Card.Description>Enter your access token and set a new password to continue</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="id" hidden aria-hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="font-semibold">Id</Form.Label>
						<Input.Root
							{...props}
							type="id"
							bind:value={$formData.id}
							placeholder="Enter your id"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors class="mt-2 text-sm" />
			</Form.Field>
			<Form.Field {form} name="token">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="font-semibold">Access Token</Form.Label>
						<Input.Root
							{...props}
							type="text"
							bind:value={$formData.token}
							placeholder="Enter your access token"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors class="mt-2 text-sm" />
			</Form.Field>

			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="font-semibold">New Password</Form.Label>

						<Input.Root
							{...props}
							type="password"
							bind:value={$formData.password}
							placeholder="Enter your new password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors class="mt-2 text-sm" />
			</Form.Field>

			<Form.Field {form} name="password1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="font-semibold">Confirm New Password</Form.Label>

						<Input.Root
							{...props}
							type="password"
							bind:value={$formData.password1}
							placeholder="Confirm your new password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors class="mt-2 text-sm" />
			</Form.Field>

			<Form.Button disabled={$submitting} class="w-full text-base font-semibold">
				{#if $submitting}
					<Loader class="time animate-spin-slow" />
					<span>Please wait...</span>
				{:else}
					Continue
				{/if}
			</Form.Button>
		</form>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="##" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
