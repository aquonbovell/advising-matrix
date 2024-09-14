<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';
	import Requirement from '$lib/components/auth/requirement.svelte';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});
	$: isPasswordValid =
		$formData.password.length >= 8 &&
		/[A-Z]/.test($formData.password) &&
		$formData.password === $formData.passwordConfirm &&
		$formData.password !== '';

	const { form: formData, enhance } = form;
</script>

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
			<Form.Label>Password</Form.Label>
			<Input {...attrs} bind:value={$formData.defaultPassword} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>New Password</Form.Label>
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
