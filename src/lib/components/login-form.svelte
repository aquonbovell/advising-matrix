<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { loginSchema, type LoginSchema } from '$lib/schemas/login';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Loader from 'lucide-svelte/icons/loader';

	let { form: data }: { form: SuperValidated<Infer<LoginSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(loginSchema)
	});

	const { form: formData, enhance, submitting } = form;
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<!-- <div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" placeholder="m@example.com" required />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					<a href="##" class="ml-auto inline-block text-sm underline">
						Forgot your password?
					</a>
				</div>
				<Input id="password" type="password" required />
			</div>
			<Button type="submit" class="w-full">Login</Button>
			<Button variant="outline" class="w-full">Login with Google</Button>
		</div>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="##" class="underline"> Sign up </a>
		</div> -->
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
						<div class="flex items-center">
							<Form.Label class="font-semibold">Password</Form.Label>
							<a href="##" class="ml-auto inline-block text-sm underline">
								Forgot your password?
							</a>
						</div>
						<Input.Root
							{...props}
							type="password"
							bind:value={$formData.password}
							placeholder="Enter your password"
						/>
						<!-- <Password.Root {...props} bind:value={$formData.password} /> -->
					{/snippet}
				</Form.Control>
				<Form.FieldErrors class="mt-2 text-sm" />
			</Form.Field>

			<Form.Button disabled={$submitting} class="w-full text-base font-semibold">
				{#if $submitting}
					<Loader class="time animate-spin-slow" />
					<span>Please wait...</span>
				{:else}
					Login
				{/if}
			</Form.Button>
		</form>
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="##" class="underline"> Sign up </a>
		</div>
	</Card.Content>
</Card.Root>
