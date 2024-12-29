<script lang="ts">
	import { applyAction, enhance as formehance } from '$app/forms';
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import { facultyUpdateSchema, type FacultyUpdateSchema } from '$lib/schemas/faculty';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data }: { data: SuperValidated<Infer<FacultyUpdateSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(facultyUpdateSchema)
	});

	const { form: formData, enhance } = form;

	let isOpen = $state(false);
</script>

<Card.Root class="mx-auto min-w-96 max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Edit Faculty Details</Card.Title>
		<Card.Description>Change the faculty details below</Card.Description>
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
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input.Root {...props} bind:value={$formData.name} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.Description>This is your public display faculty name.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-row space-x-4">
				<AlertDialog.Root bind:open={isOpen}>
					<AlertDialog.Trigger class={Button.buttonVariants({ class: 'w-full' })}>
						Update
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently change the faculty details.
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
