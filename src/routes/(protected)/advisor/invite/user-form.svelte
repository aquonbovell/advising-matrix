<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { formSchema, type FormSchema } from './schema.js';
	import * as Select from '$lib/components/ui/select';
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

<form method="POST" use:enhance class="">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="official_email">
		<Form.Control let:attrs>
			<Form.Label>Official Email</Form.Label>
			<Input {...attrs} bind:value={$formData.official_email} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="alternate_email">
		<Form.Control let:attrs>
			<Form.Label>Alternate Email</Form.Label>
			<Input {...attrs} bind:value={$formData.alternate_email} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex flex-col justify-between gap-5 md:flex-row">
		<Form.Field {form} name="majorId">
			<Form.Control let:attrs>
				<Form.Label>First Major</Form.Label>
				<Select.Root
					selected={selectedMajorId}
					onSelectedChange={(v) => {
						console.log(v);

						v && ($formData.majorId = v.value);
					}}
				>
					<Select.Trigger class="w-[280px]" {...attrs}>
						<Select.Value placeholder="Select first major" />
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
				<Form.Label>Second Major/Minor</Form.Label>
				<Select.Root
					selected={selectedMinorId}
					onSelectedChange={(v) => {
						v && ($formData.minorId = v.value);
					}}
				>
					<Select.Trigger class="w-[280px]" {...attrs}>
						<Select.Value placeholder="Select second Major/Minor" />
					</Select.Trigger>
					<Select.Content class="max-h-60 overflow-auto">
						<Select.Item value={null}>No Minor</Select.Item>
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
	<Form.Button class="mt-5 w-full">Invite</Form.Button>
</form>
