<script lang="ts">
	import { applyAction, enhance as formehance } from '$app/forms';
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { advisorUpdateSchema, roles, type AdvisorUpdateSchema } from '$lib/schemas/user';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data }: { data: SuperValidated<Infer<AdvisorUpdateSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(advisorUpdateSchema)
	});

	const { form: formData, enhance } = form;

	let isOpen = $state(false);
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Edit Account Details</Card.Title>
		<Card.Description
			>Change the account details below to update an account for {$formData.role}</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/edit" use:enhance>
			<Form.Field {form} name="id" hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Id</Form.Label>
						<Input.Root {...props} bind:value={$formData.id} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input.Root {...props} bind:value={$formData.username} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.Description>This is your public display username.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input.Root {...props} bind:value={$formData.email} required type="email" />
					{/snippet}
				</Form.Control>
				<Form.Description>This is your public display email.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Fieldset {form} name="role" class="space-y-3">
				<Form.Legend>Select a role for the user...</Form.Legend>
				<RadioGroup.Root bind:value={$formData.role} class="flex flex-row " name="type" required>
					{#each roles as role (role)}
						<div class="flex items-center space-x-3 space-y-0">
							<Form.Control>
								{#snippet children({ props })}
									<RadioGroup.Item value={role} {...props} />
									<Form.Label class="font-normal">{role}</Form.Label>
								{/snippet}
							</Form.Control>
						</div>
					{/each}
				</RadioGroup.Root>
				<Form.FieldErrors />
			</Form.Fieldset>
			<div class="flex flex-row space-x-1">
				<AlertDialog.Root bind:open={isOpen}>
					<AlertDialog.Trigger class={Button.buttonVariants({ class: 'w-full' })}>
						Update
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently change the account details and
								may prevent the user from accessing the account.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action
								type="submit"
								class={Button.buttonVariants({ variant: 'destructive' })}
								onclick={() => {
									isOpen = false;
								}}>Continue</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
				<AlertDialog.Root bind:open={isOpen}>
					<AlertDialog.Trigger
						class={Button.buttonVariants({ variant: 'destructive', class: 'w-full' })}
					>
						Delete
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently delete the account and remove
								the data from our servers.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<form
								method="POST"
								action="?/delete"
								use:formehance={() => {
									isOpen = false;
									return async ({ result }) => {
										await applyAction(result);
									};
								}}
								class="flex gap-2"
							>
								<input type="text" hidden name="id" value={page.params.id} />
								<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									type="submit"
									class={Button.buttonVariants({ variant: 'destructive' })}
									>Continue</AlertDialog.Action
								>
							</form>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</form>
	</Card.Content>
</Card.Root>
