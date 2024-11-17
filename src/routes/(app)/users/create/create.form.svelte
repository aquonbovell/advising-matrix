<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { userCreationSchema, type UserCreationSchema, userOptions } from './userCreation.schema';

	export let data: SuperValidated<Infer<UserCreationSchema>>;

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(userCreationSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="John Doe..." />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Username</Form.Label>
				<Input {...props} bind:value={$formData.username} placeholder="janedoe..." />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Email</Form.Label>
				<Input
					{...props}
					type="email"
					bind:value={$formData.email}
					placeholder="example@mycavehill.uwi.edu"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="alternateEmail">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Alternate Email</Form.Label>
				<Input
					{...props}
					bind:value={$formData.alternateEmail}
					placeholder="example@outlook.components"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="role">
		<Form.Control>
			{#snippet children({ props })}
				<RadioGroup.Root bind:value={$formData.role} {...props} class="flex">
					{#each userOptions as option}
						<div class="flex flex-row items-center space-x-2">
							<RadioGroup.Item value={option} id={option} />
							<Label for={option}>{option}</Label>
						</div>
					{/each}
				</RadioGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button type="submit">Create</Form.Button>
</form>
