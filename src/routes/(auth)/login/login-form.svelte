<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';

	export let data: SuperValidated<Infer<FormSchema>>;

	const toastState = getToastState();

	const form = superForm(data, {
		validators: zodClient(formSchema),
		delayMs: 500,
		timeoutMs: 8000
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Email</Form.Label>
			<Input {...attrs} bind:value={$formData.email} placeholder="m@mycavehill.uwi.edu" />
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
	<Form.Button class="mt-5 w-full">Login</Form.Button>
	<Button class="mt-5 w-full" variant="outline" type="button"
		><a href="/forgot-password">Forgot Password?</a></Button
	>
</form>
