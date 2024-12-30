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
	import {
		disciplines,
		levels,
		options,
		requirementUpdateSchema,
		types,
		type RequirementUpdateSchema
	} from '$lib/schemas/requirement';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let {
		data,
		courses,
		faculties
	}: {
		data: SuperValidated<Infer<RequirementUpdateSchema>>;
		courses: { id: string; code: string; name: string }[];
		faculties: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(requirementUpdateSchema)
	});

	const { form: formData, enhance } = form;

	let isOpenUpdate = $state(false);
	let isOpenDelete = $state(false);
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Edit Major Details</Card.Title>
		<Card.Description
			>Change the major details below to update a major for students</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance action="?/edit">
			<Form.Field {form} name="id" hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Id</Form.Label>
						<Input.Root {...props} bind:value={$formData.id} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Fieldset {form} name="type" class="space-y-3">
				<Form.Legend>Select a requirement type...</Form.Legend>
				<RadioGroup.Root
					bind:value={() => $formData.type,
					(v) => {
						$formData.type = v;
						$formData.details = [];
					}}
					class="flex flex-row "
					name="type"
					required
				>
					{#each types as type (type)}
						<div class="flex items-center space-x-3 space-y-0">
							<Form.Control>
								{#snippet children({ props })}
									<RadioGroup.Item value={type} {...props} />
									<Form.Label class="font-normal">{type}</Form.Label>
								{/snippet}
							</Form.Control>
						</div>
					{/each}
				</RadioGroup.Root>
				<Form.FieldErrors />
			</Form.Fieldset>

			<Form.Fieldset {form} name="option" class="space-y-3">
				<Form.Legend>Select a requirement option...</Form.Legend>
				<RadioGroup.Root
					bind:value={$formData.option}
					class="flex flex-row "
					name="option"
					required
				>
					{#each options as option (option)}
						<div class="flex items-center space-x-3 space-y-0">
							<Form.Control>
								{#snippet children({ props })}
									<RadioGroup.Item value={option} {...props} />
									<Form.Label class="font-normal">{option}</Form.Label>
								{/snippet}
							</Form.Control>
						</div>
					{/each}
				</RadioGroup.Root>
				<Form.FieldErrors />
			</Form.Fieldset>

			<Form.Field {form} name="level">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Prerequisites</Form.Label>
						<Select.Root
							type="multiple"
							bind:value={() => $formData.level.map((l) => l.toString()),
							(v) => ($formData.level = v.map((l) => parseInt(l)))}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.level.length > 0
									? levels
											.filter((l) => $formData.level.includes(l))
											.map((l) => `Level ${l}`)
											.join('\n\n')
									: 'Select verified levels to display'}
							</Select.Trigger>
							<Select.Content>
								{#each levels as level (level)}
									<Select.Item value={level.toString()} label={`Level ${level}`} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed requirement level.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="credits">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Credits</Form.Label>
						<Input.Root
							{...props}
							bind:value={() => $formData.credits.toString(),
							(v) => ($formData.credits = parseInt(v))}
							required
							type="number"
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed requirement name.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="details">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Details</Form.Label>
						<Select.Root
							type="multiple"
							bind:value={() => $formData.details, (v) => ($formData.details = v)}
							name={props.name}
						>
							{#if $formData.type === 'courses'}
								<Select.Trigger {...props} class="h-fit  text-wrap">
									{$formData.details.length > 0
										? courses
												.filter((c) => $formData.details.includes(c.id))
												.map((c) => c.name)
												.join(', ')
										: 'Select verified courses to display'}
								</Select.Trigger>
								<Select.Content>
									{#each courses as course (course.id)}
										<Select.Item value={course.id} label={course.code + ' - ' + course.name} />
									{/each}
								</Select.Content>
							{:else if $formData.type === 'faculties'}
								<Select.Trigger {...props}>
									{$formData.details.length > 0
										? faculties
												.filter((f) => $formData.details.includes(f.id))
												.map((f) => f.name)
												.join(', ')
										: 'Select verified faculties to display'}
								</Select.Trigger>
								<Select.Content>
									{#each faculties as faculty (faculty.id)}
										<Select.Item value={faculty.id} label={faculty.name} />
									{/each}
								</Select.Content>
							{:else}
								<Select.Trigger {...props}>
									{$formData.details.length > 0
										? $formData.details.join(', ')
										: 'Select verified disciplines to display'}
								</Select.Trigger>
								<Select.Content>
									{#each disciplines as discipline (discipline)}
										<Select.Item value={discipline} label={discipline} />
									{/each}
								</Select.Content>
							{/if}
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed requirement courses</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-row space-x-1">
				<AlertDialog.Root bind:open={isOpenUpdate}>
					<AlertDialog.Trigger class={Button.buttonVariants({ class: 'w-full' })}>
						Update
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently change the requirement details.
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
								This action cannot be undone. This will permanently delete the requirement and
								remove the data from our servers.
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
