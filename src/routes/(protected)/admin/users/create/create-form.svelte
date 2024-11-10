<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
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

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}
</script>

<pre>{JSON.stringify($formData, null, 2)}</pre>

<form method="POST" use:enhance class="space-y-4" action="?/create">
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

	<Form.Button type="submit">Create</Form.Button>
</form>
