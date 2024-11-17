<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Input from '$lib/components/ui/input';
	import * as Password from '$lib/components/ui/password';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import Icon from '@iconify/svelte';
	import { onboardingSchema, type OnboardingSchema } from './onboarding.schema';

	export let data: SuperValidated<Infer<OnboardingSchema>>;

	const form = superForm(data, {
		validators: zodClient(onboardingSchema)
	});

	const { form: formData, enhance, submitting, allErrors } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="id">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Id</Form.Label>
				<Input.Root {...props} bind:value={$formData.id} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="token">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Token</Form.Label>
				<Input.Root {...props} bind:value={$formData.token} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Password</Form.Label>
				<Password.Root {...props} bind:value={$formData.password} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password1">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Confirm Password</Form.Label>
				<Password.Root {...props} bind:value={$formData.password1} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="h-12 w-full text-base font-medium">
		<!-- {#if $submitting}
			<Icon icon="eos-icons:bubble-loading" />
			<span>Please wait...</span>
		{:else} -->
		Continue
		<!-- {/if} -->
	</Form.Button>
</form>
