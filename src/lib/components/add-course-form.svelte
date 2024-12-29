<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as TextArea from '$lib/components/ui/textarea/index.js';
	import { courseCreationSchema, options, type CourseCreationSchema } from '$lib/schemas/course';
	import { toast } from 'svelte-sonner';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let {
		data,
		departments,
		courses
	}: {
		data: SuperValidated<Infer<CourseCreationSchema>>;
		departments: { id: string; name: string }[];
		courses: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(courseCreationSchema)
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
							goto(`/courses/show/${$message.id}`);
						}
					}
				});
			}
		}
	});

	console.log(courses);
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Add a course</Card.Title>
		<Card.Description>Enter the name of a course</Card.Description>
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
				<Form.Description>This is the public displayed course name.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="code">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Code</Form.Label>
						<Input.Root {...props} bind:value={$formData.code} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed course code.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<TextArea.Root
							{...props}
							bind:value={$formData.description}
							required
							placeholder="lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed course description.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="credits">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Credits</Form.Label>
						<Input.Root {...props} bind:value={$formData.credits} required type="number" />
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed course credit.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="departmentId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Department</Form.Label>
						<Select.Root
							type="single"
							bind:value={() => $formData.departmentId, (v) => ($formData.departmentId = v)}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.departmentId
									? departments.find((f) => f.id == $formData.departmentId)?.name
									: 'Select a verified department to display'}
							</Select.Trigger>
							<Select.Content>
								{#each departments as department (department.id)}
									<Select.Item value={department.id} label={department.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>
					You can manage the departments <a href="/courses/departments">here</a> as a separate entity.
					This is the department that the course belongs to.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Fieldset {form} name="type" class="space-y-3">
				<Form.Legend>Select a prerequisite type...</Form.Legend>
				<RadioGroup.Root bind:value={$formData.type} class="flex flex-row " name="type" required>
					{#each options as option (option)}
						<div class="flex items-center space-x-3 space-y-0">
							<Form.Control>
								{#snippet children({ props })}
									<RadioGroup.Item value={option} {...props} />
									<Form.Label class="font-normal"
										>{option.toLowerCase()} of the following prerequisites</Form.Label
									>
								{/snippet}
							</Form.Control>
						</div>
					{/each}
				</RadioGroup.Root>
				<Form.FieldErrors />
			</Form.Fieldset>

			<Form.Field {form} name="prerequisites">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Prerequisites</Form.Label>
						<Select.Root
							type="multiple"
							bind:value={() => $formData.prerequisites, (v) => ($formData.prerequisites = v)}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.prerequisites.length > 0
									? courses
											.filter((c) => $formData.prerequisites.includes(c.id))
											.map((c) => c.name)
											.join('\n')
									: 'Select verified prerequisites to display'}
							</Select.Trigger>
							<Select.Content>
								{#each courses as course (course.id)}
									<Select.Item value={course.id} label={course.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed course prerequisites.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button class="w-full" type="submit">Submit</Form.Button>
		</form>
	</Card.Content>
</Card.Root>
