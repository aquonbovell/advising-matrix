<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { userCreationSchema, type UserCreationSchema, userOptions } from './userCreation.schema';
	import { toast } from 'svelte-sonner';
	import Loader from 'lucide-svelte/icons/loader';
	let { data }: { data: SuperValidated<Infer<UserCreationSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(userCreationSchema)
	});

	const { form: formData, enhance, message, submitting } = form;

	$effect(() => {
		if ($message) {
			if ($message.type === 'success') {
				toast.success($message.message);
			} else {
				toast.error($message.message);
			}
		}
	});
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
				<Input {...props} bind:value={$formData.alternateEmail} placeholder="example@outlook.com" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Fieldset {form} name="role">
		<Form.Legend class="font-semibold">Role</Form.Legend>
		<RadioGroup.Root bind:value={$formData.role} class="flex">
			{#each userOptions as option}
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex flex-row items-center space-x-2">
							<RadioGroup.Item value={option} {...props} />
							<Form.Label for={option}>{option.toLocaleLowerCase()}</Form.Label>
						</div>
					{/snippet}
				</Form.Control>
			{/each}
		</RadioGroup.Root>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Fieldset>
	<Form.Button disabled={$submitting} class="text-base font-semibold">
		{#if $submitting}
			<Loader class="time animate-spin-slow" />
			<span>Please wait...</span>
		{:else}
			Create
		{/if}
	</Form.Button>
</form>
