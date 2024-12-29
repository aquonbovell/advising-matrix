<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { registerSchema, type RegisterSchema } from '$lib/schemas/register';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data }: { data: SuperValidated<Infer<RegisterSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(registerSchema)
	});

	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Register</Card.Title>
		<Card.Description>Enter your account details below to create an account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input
							{...props}
							bind:value={$formData.username}
							required
							type="text"
							autocomplete="name webauthn"
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>This is your public display username.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input
							{...props}
							bind:value={$formData.email}
							required
							autocomplete="email webauthn"
							type="email"
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>This is your public display email.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Password</Form.Label>
						<Input
							{...props}
							bind:value={$formData.password}
							name="password"
							autocomplete="new-password webauthn"
							required
							type="password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="passwordConfirm">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Confirm Password</Form.Label>
						<Input
							{...props}
							bind:value={$formData.passwordConfirm}
							name="passwordConfirm"
							required
							type="password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button class="w-full" type="submit">Submit</Form.Button>
		</form>
		<div class="mt-4 text-center text-sm">
			Already have an account?
			<a href="/login" class="underline"> Login </a>
		</div>
	</Card.Content>
</Card.Root>
