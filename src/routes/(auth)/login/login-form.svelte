<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Button from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PasswordInput } from '$lib/components/ui/password-input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';

	import { Loader2 } from 'lucide-svelte';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		delayMs: 500,
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Email</Form.Label>
			<Input {...attrs} bind:value={$formData.email} placeholder="m@mycavehill.uwi.edu" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Password</Form.Label>
			<PasswordInput {...attrs} bind:value={$formData.password} type="password" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button class="h-12 w-full text-base font-medium" disabled={$submitting}>
		{#if $submitting}
			<Loader2 class="mr-2 size-5 animate-spin" />
			<span>Logging in...</span>
		{:else}
			Login
		{/if}
	</Form.Button>

	<Button.Root class="h-12 w-full text-base font-medium" variant="link" href="/forgot-password">
		Forgot Password?
	</Button.Root>
</form>
