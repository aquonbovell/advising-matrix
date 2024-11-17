<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Input from '$lib/components/ui/input';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { registerSchema, type RegisterSchema } from './register.schema';
	import Icon from '@iconify/svelte';

	export let data: SuperValidated<Infer<RegisterSchema>>;

	const form = superForm(data, {
		validators: zodClient(registerSchema)
	});

	const { form: formData, enhance, submitting, allErrors } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Name</Form.Label>
				<Input.Root {...props} bind:value={$formData.name} placeholder="Jane Doe" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Username</Form.Label>
				<Input.Root {...props} bind:value={$formData.username} placeholder="janedoe24" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Email</Form.Label>
				<Input.Root
					{...props}
					type="email"
					bind:value={$formData.email}
					placeholder="example@mycavehill.uwi.edu"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="alternateEmail">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Alternate Email</Form.Label>
				<Input.Root
					{...props}
					type="email"
					bind:value={$formData.alternateEmail}
					placeholder="example@outlook.com"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="h-12 w-full text-base font-medium">
		<!-- {#if $submitting}
			<Icon icon="eos-icons:bubble-loading" />
			<span>Please wait...</span>
		{:else} -->
		Register
		<!-- {/if} -->
	</Form.Button>
</form>
