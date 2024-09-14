<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Button from '$lib/components/ui/button';
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
		$formData.password === $formData.confirmPassword &&
		$formData.password !== '';

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Email</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.email}
				placeholder="m@mycavehill.uwi.edu"
				type="email"
			/>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="alternate_email">
		<Form.Control let:attrs>
			<Form.Label>Alternate Email</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.alternate_email}
				placeholder="m@outlook.com"
				type="email"
			/>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>Password</Form.Label>
			<Input {...attrs} bind:value={$formData.password} type="password" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="confirmPassword">
		<Form.Control let:attrs>
			<Form.Label>Confirm Password</Form.Label>
			<Input {...attrs} bind:value={$formData.confirmPassword} type="password" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Requirement password={$formData.password} confirmPassword={$formData.confirmPassword} />
	<Form.Button class="mt-5 w-full" disabled={!isPasswordValid}>Continue</Form.Button>
	<Button.Root variant="link" class="w-full" href="/login">Sign In</Button.Root>
</form>
