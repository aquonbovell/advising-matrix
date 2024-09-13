<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';
	import Requirement from '$lib/components/auth/requirement.svelte';
	import { getToastState } from '$lib/components/toast/toast-state.svelte.js';

	export let data: SuperValidated<Infer<FormSchema>>;

	const toastState = getToastState();

	const form = superForm(data, {
		validators: zodClient(formSchema),
		delayMs: 500,
		timeoutMs: 8000
	});
	$: isPasswordValid =
		$formData.password.length >= 8 &&
		/[A-Z]/.test($formData.password) &&
		$formData.password === $formData.passwordConfirm &&
		$formData.password !== '';

	const { form: formData, enhance, errors } = form;
</script>

<pre>{JSON.stringify(form, null, 2)}</pre>

<form method="POST" use:enhance>
	<Form.Field {form} name="token">
		<Form.Control let:attrs>
			<Form.Label>Token</Form.Label>
			<Input {...attrs} bind:value={$formData.token} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Email</Form.Label>
			<Input {...attrs} bind:value={$formData.email} placeholder="m@mycavehill.uwi.edu" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="defaultPassword">
		<Form.Control let:attrs>
			<Form.Label>defaultPassword</Form.Label>
			<Input {...attrs} bind:value={$formData.defaultPassword} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>Password</Form.Label>
			<Input {...attrs} bind:value={$formData.password} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="passwordConfirm">
		<Form.Control let:attrs>
			<Form.Label>Confirm Password</Form.Label>
			<Input {...attrs} bind:value={$formData.passwordConfirm} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Requirement password={$formData.password} confirmPassword={$formData.passwordConfirm} />
	<Form.Button class="mt-5 w-full" disabled={!isPasswordValid}>Continue</Form.Button>
</form>
