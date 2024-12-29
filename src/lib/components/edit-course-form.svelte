<script lang="ts">
	import { applyAction, enhance as formehance } from '$app/forms';
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as TextArea from '$lib/components/ui/textarea/index.js';
	import { courseUpdateSchema, options, type CourseUpdateSchema } from '$lib/schemas/course';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let {
		data,
		departments,
		courses
	}: {
		data: SuperValidated<Infer<CourseUpdateSchema>>;
		departments: { id: string; name: string }[];
		courses: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(courseUpdateSchema)
	});

	const { form: formData, enhance } = form;

	let isOpenUpdate = $state(false);
	let isOpenDelete = $state(false);
</script>

<Card.Root class="mx-auto min-w-96 max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Edit Course Details</Card.Title>
		<Card.Description>Change the course details below</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance action="?/edit">
			<Form.Field {form} name="id" hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input.Root {...props} bind:value={$formData.id} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
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
			<div class="flex flex-row space-x-4">
				<AlertDialog.Root bind:open={isOpenUpdate}>
					<AlertDialog.Trigger class={Button.buttonVariants({ class: 'w-full' })}>
						Update
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently change the faculty details.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action
								type="submit"
								class={Button.buttonVariants({ variant: 'destructive' })}
								onclick={() => {
									isOpenUpdate = false;
								}}>Continue</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
				<AlertDialog.Root bind:open={isOpenDelete}>
					<AlertDialog.Trigger
						class={Button.buttonVariants({ variant: 'destructive', class: 'w-full' })}
					>
						Delete
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently delete the account and remove
								the data from our servers.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<form
								method="POST"
								action="?/delete"
								use:formehance={() => {
									isOpenDelete = false;
									return async ({ result }) => {
										await applyAction(result);
									};
								}}
								class="flex gap-2"
							>
								<input type="text" hidden name="id" value={page.params.id} />
								<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									type="submit"
									class={Button.buttonVariants({ variant: 'destructive' })}
									>Continue</AlertDialog.Action
								>
							</form>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</form>
	</Card.Content>
</Card.Root>
