<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { departmentCreationSchema, type DepartmentCreationSchema } from '$lib/schemas/department';
	import { toast } from 'svelte-sonner';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let {
		data,
		faculties
	}: {
		data: SuperValidated<Infer<DepartmentCreationSchema>>;
		faculties: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(departmentCreationSchema)
	});

	const { form: formData, enhance, message } = form;

	$effect(() => {
		if ($message) {
			if ($message.type === 'success') {
				toast.success($message.message, {
					description: new Date().toLocaleString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: '2-digit',
						hour: 'numeric',
						minute: '2-digit',
						hour12: true
					}),
					action: {
						label: 'View',
						onClick: () => {
							goto(`/courses/departments/show/${$message.id}`);
						}
					}
				});
			}
		}
	});
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Add a department</Card.Title>
		<Card.Description>Enter the name of a department</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input.Root {...props} bind:value={$formData.name} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed department name.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="facultyId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Faculty</Form.Label>
						<Select.Root
							type="single"
							bind:value={() => $formData.facultyId, (v) => ($formData.facultyId = v)}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.facultyId
									? faculties.find((f) => f.id == $formData.facultyId)?.name
									: 'Select a verified faculty to display'}
							</Select.Trigger>
							<Select.Content>
								{#each faculties as faculty (faculty.id)}
									<Select.Item value={faculty.id} label={faculty.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>
					You can manage the faculties <a href="/courses/faculties">here</a> as a separate entity. This
					is the faculty that the department belongs to.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button class="w-full" type="submit">Submit</Form.Button>
		</form>
	</Card.Content>
</Card.Root>
