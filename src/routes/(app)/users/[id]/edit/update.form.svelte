<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Checkbox from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { userUpdateSchema, type UserUpdateSchema, userOptions } from './userUpdate.schema';
	import Loader from 'lucide-svelte/icons/loader';
	import { toast } from 'svelte-sonner';
	let { data }: { data: SuperValidated<Infer<UserUpdateSchema>> } = $props();

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(userUpdateSchema)
	});

	const { form: formData, enhance, message, submitting, allErrors } = form;
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

<pre>{JSON.stringify($message, null, 2)}</pre>

<form method="POST" use:enhance class="space-y-4" action="?/edit">
	<Form.Field {form} name="id" hidden>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold" hidden>Id</Form.Label>
				<Input {...props} bind:value={$formData.id} placeholder="John Doe..." type="hidden" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" hidden />
	</Form.Field>
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
	<Form.Field {form} name="onboarded">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Onboarded</Form.Label>
				<Checkbox.Root {...props} bind:checked={$formData.onboarded} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Fieldset {form} name="role">
		<Form.Legend class="font-semibold">Role</Form.Legend>
		<RadioGroup.Root bind:value={$formData.role} class="flex" name="role">
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
			Update
		{/if}
	</Form.Button>
</form>
