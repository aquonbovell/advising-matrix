<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { departmentSchema, type DepartmentSchema } from './schema.js';

	export let data: SuperValidated<Infer<DepartmentSchema>>;

	export let faculties: { id: string; name: string }[];

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(departmentSchema)
	});

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}

	$: selectedFaculty = $formData.facultyId
		? {
				label:
					faculties[faculties.findIndex((f) => f.id === $formData.facultyId)]?.name ||
					'Select a verified faculty',
				value: $formData.facultyId
			}
		: undefined;
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Department</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="CMP" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="facultyId">
		<Form.Control let:attrs>
			<Form.Label>Faculty</Form.Label>
			<Select.Root
				selected={selectedFaculty}
				onSelectedChange={(v) => {
					v && ($formData.facultyId = v.value);
				}}
			>
				<Select.Trigger {...attrs}>
					<Select.Value placeholder="Select a verified faculty" />
				</Select.Trigger>
				<Select.Content>
					{#each faculties as faculty}
						<Select.Item value={faculty.id} label={faculty.name} />
					{/each}
				</Select.Content>
			</Select.Root>
			<input hidden bind:value={$formData.facultyId} name={attrs.name} />
		</Form.Control>
		<Form.Description>
			Select a verified faculty from the list. If the faculty is not listed, please contact the
			administrator.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Create</Form.Button>
</form>
