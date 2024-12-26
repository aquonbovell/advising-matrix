<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { twoFASchema, type TwoFASchema } from '$lib/schemas/twoFactor';

	let { data, qrcode }: { data: SuperValidated<Infer<TwoFASchema>>; qrcode: string } = $props();

	const form = superForm(data, {
		validators: zodClient(twoFASchema)
	});

	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto max-w-xs">
	<Card.Header>
		<Card.Title class="text-2xl">Set up two-factor authentication</Card.Title>
		{@html qrcode}
	</Card.Header>
	<Card.Content class="space-y-3">
		<form method="post" use:enhance>
			<Form.Field {form} name="encodedKey" hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Key</Form.Label>
						<Input.Root {...props} bind:value={$formData.encodedKey} required />
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="code">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Verify the code from the app</Form.Label>
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
			<Form.Button>Save</Form.Button>
		</form>
	</Card.Content>
</Card.Root>
