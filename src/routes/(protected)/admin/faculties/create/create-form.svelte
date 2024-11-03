<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { facultySchema, type FacultySchema } from './schema.js';

	export let data: SuperValidated<Infer<FacultySchema>>;

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(facultySchema)
	});

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Faculty</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="Science and Technology" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button>Create</Form.Button>
</form>
