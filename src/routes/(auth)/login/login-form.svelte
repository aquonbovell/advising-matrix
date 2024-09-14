<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Button from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
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
			<Input {...attrs} bind:value={$formData.password} type="password" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-5 w-full">Login</Form.Button>
	<Button.Root class="w-full" variant="link" href="/forgot-password">Forgot Password?</Button.Root>
</form>
