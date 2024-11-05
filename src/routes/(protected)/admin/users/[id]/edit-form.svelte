<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { userSchema, type UserSchema, userOptions } from './schema.js';
	export let data: SuperValidated<Infer<UserSchema>>;

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(userSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message, validateForm, submit } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}
</script>

<form method="POST" use:enhance class="space-y-4" action="?/edit">
	<Form.Field {form} name="id">
		<Form.Control let:attrs>
			<Input {...attrs} bind:value={$formData.id} type="hidden" />
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="John Doe..." />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Email</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.email}
				type="email"
				placeholder="example@cavehill.uwi.edu"
			/>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="alternate_email">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Alternate Email</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.alternate_email}
				type="email"
				placeholder="example@outlook.com"
			/>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="role">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Role</Form.Label>
			<RadioGroup.Root bind:value={$formData.role} {...attrs} class="flex">
				{#each userOptions as option}
					<div class="flex flex-row items-center space-x-2">
						<RadioGroup.Item value={option} id={option} />
						<Label for={option}>{option}</Label>
					</div>
				{/each}
			</RadioGroup.Root>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Dialog.Root>
		<Dialog.Trigger>
			<Button.Root type="button">Update</Button.Root></Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently change this account credentials.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close
					on:click={async () => {
						const response = await validateForm();
						if (response.valid) {
							submit();
						}
					}}
					class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-red-500 shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
					>Update</Dialog.Close
				>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</form>
