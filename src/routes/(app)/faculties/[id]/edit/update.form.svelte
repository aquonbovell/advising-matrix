<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Checkbox from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { facultyUpdateSchema, type FacultyUpdateSchema } from './facultyUpdateSchema.schema';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: SuperValidated<Infer<FacultyUpdateSchema>> } = $props();

	const form = superForm(data, {
		validators: zodClient(facultyUpdateSchema)
	});

	const { form: formData, enhance, message } = form;

	$effect(() => {
		if ($message) {
			if ($message.type === 'success') {
				toast.success($message.message);
			} else {
				toast.error($message.message);
			}
			invalidateAll();
		}
	});
</script>

<form method="POST" use:enhance class="space-y-4" action="?/edit">
	<Form.Field {form} name="id" hidden={true}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold" hidden={true}>Faculty Id</Form.Label>
				<Input {...props} bind:value={$formData.id} type="hidden" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" hidden={true} />
	</Form.Field>
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Faculty Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Science & Technology..." />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button type="submit">Update</Form.Button>
</form>
