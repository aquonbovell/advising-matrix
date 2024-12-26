<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { twoFAVerifySchema, type TwoFAVerifySchema } from '$lib/schemas/twoFactor';

	let { data }: { data: SuperValidated<Infer<TwoFAVerifySchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(twoFAVerifySchema)
	});

	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-md">
	<Card.Header>
		<Card.Title class="text-2xl">Verify with 2FA</Card.Title>
		<Card.Description class="text-gray-500">
			Enter the code from your authenticator app</Card.Description
		>
	</Card.Header>
	<Card.Content class="space-y-3">
		<form method="post" use:enhance>
			<Form.Field {form} name="code">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Verify your code</Form.Label>
						<InputOTP.Root
							maxlength={6}
							{...props}
							class="mx-auto w-fit"
							bind:value={$formData.code}
							required
						>
							{#snippet children({ cells })}
								<InputOTP.Group>
									{#each cells.slice(0, 3) as cell}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
								<InputOTP.Separator />
								<InputOTP.Group>
									{#each cells.slice(3, 6) as cell}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Verify</Form.Button>
		</form>
	</Card.Content>
</Card.Root>
