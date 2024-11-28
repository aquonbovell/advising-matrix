<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Input from '$lib/components/ui/input';
	import * as Password from '$lib/components/ui/password';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema, type LoginSchema } from './login.schema';
	import Icon from '@iconify/svelte';

	let { data }: { data: SuperValidated<Infer<LoginSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(loginSchema)
	});

	const { form: formData, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
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
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Password</Form.Label>
				<Password.Root {...props} bind:value={$formData.password} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button disabled={$submitting} class="w-full text-base font-semibold">
		{#if $submitting}
			<Icon icon="eos-icons:bubble-loading" />
			<span>Please wait...</span>
		{:else}
			Login
		{/if}
	</Form.Button>

	<Form.Button
		variant="link"
		class="w-full text-base font-semibold"
		href="/forgot-password"
		type="button"
	>
		Forgot Password?
	</Form.Button>
</form>
