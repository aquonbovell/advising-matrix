<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import { advisorSchema, type AdvisorSchema } from '$lib/schemas/user';
	import { toast } from 'svelte-sonner';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data }: { data: SuperValidated<Infer<AdvisorSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(advisorSchema)
	});

	const { form: formData, enhance, message } = form;

	$effect(() => {
		if ($message) {
			if ($message.type === 'success') {
				toast.success($message.message, {
					description: new Date().toLocaleString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: '2-digit',
						hour: 'numeric',
						minute: '2-digit',
						hour12: true
					}),
					action: {
						label: 'View',
						onClick: () => {
							goto(`/users/advisors/show/${$message.id}`);
						}
					}
				});
			}
		}
	});
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Add an advisor</Card.Title>
		<Card.Description
			>Enter the account details below to create an account for an advisor</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input.Root
							{...props}
							bind:value={$formData.username}
							required
							autocomplete="name webauthn"
							type="text"
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
						<Input.Root
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
			<Form.Button class="w-full" type="submit">Submit</Form.Button>
		</form>
	</Card.Content>
</Card.Root>
