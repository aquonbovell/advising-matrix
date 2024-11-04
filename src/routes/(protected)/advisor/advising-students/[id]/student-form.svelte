<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';
	export let data: SuperValidated<Infer<FormSchema>>;
	export let majors: { name: string; id: string }[];
	export let minors: { name: string; id: string }[];

	const toastState = getToastState();

	const form = superForm(data, {
		validators: zodClient(formSchema),
		delayMs: 500,
		timeoutMs: 8000
	});

	const { form: formData, enhance, message } = form;

	$: if ($message) {
		console.log($message);

		toastState.add('Notice', $message, 'success');
	}

	$: selectedMajorId = $formData.majorId
		? {
				label: majors.find((major) => major.id === $formData.majorId)?.name,
				value: $formData.majorId
			}
		: undefined;

	$: selectedMinorId = $formData.minorId
		? {
				label: minors.find((minor) => minor.id === $formData.minorId)?.name,
				value: $formData.minorId
			}
		: undefined;
</script>

<form method="POST" use:enhance class="" action="?/update">
	<Form.Field {form} name="id">
		<Form.Control let:attrs>
			<Form.Label hidden>Name</Form.Label>
			<input hidden bind:value={$formData.id} name={attrs.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Official Email</Form.Label>
			<Input {...attrs} bind:value={$formData.email} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="alternateEmail">
		<Form.Control let:attrs>
			<Form.Label>Alternate Email</Form.Label>
			<Input {...attrs} bind:value={$formData.alternateEmail} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="alternateEmailConfirm">
		<Form.Control let:attrs>
			<Form.Label>Confirm Alternate Email</Form.Label>
			<Input {...attrs} bind:value={$formData.alternateEmailConfirm} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex justify-between gap-5">
		<Form.Field {form} name="majorId">
			<Form.Control let:attrs>
				<Form.Label>Major</Form.Label>
				<Select.Root
					selected={selectedMajorId}
					onSelectedChange={(v) => {
						console.log(v);

						v && ($formData.majorId = v.value);
					}}
				>
					<Select.Trigger class="w-[280px]" {...attrs}>
						<Select.Value placeholder="Select a Major" />
					</Select.Trigger>
					<Select.Content class="max-h-60 overflow-auto">
						{#each majors as major}
							<Select.Item value={major.id}>{major.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<input hidden bind:value={$formData.majorId} name={attrs.name} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="minorId">
			<Form.Control let:attrs>
				<Form.Label>Major/Minor</Form.Label>
				<Select.Root
					selected={selectedMinorId}
					onSelectedChange={(v) => {
						console.log(v);

						v && ($formData.minorId = v.value);
					}}
				>
					<Select.Trigger class="w-[280px]" {...attrs}>
						<Select.Value placeholder="Select a Major/Minor" />
					</Select.Trigger>
					<Select.Content class="max-h-60 overflow-auto">
						{#each minors as minor}
							<Select.Item value={minor.id}>{minor.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<input hidden bind:value={$formData.minorId} name={attrs.name} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<AlertDialog.Root>
		<AlertDialog.Trigger><Button.Root class="mt-5 w-full">Update</Button.Root></AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently update the student's account on our
					servers.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					on:click={async (event) => {
						const userform = await form.validateForm();
						if (userform.valid) {
							form.submit();
						}
						console.log('clicked', event);
					}}>Continue</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</form>
