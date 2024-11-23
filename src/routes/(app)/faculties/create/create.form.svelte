<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { facultyCreationSchema, type FacultyCreationSchema } from './facultyCreation.schema';
	import { toast } from 'svelte-sonner';

	let { data }: { data: SuperValidated<Infer<FacultyCreationSchema>> } = $props();

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(facultyCreationSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message } = form;

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

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Faculty Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Science & Technology" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button type="submit">Create</Form.Button>
</form>
