<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { majorCreationSchema, type MajorCreationSchema } from '$lib/schemas/major';
	import {
		disciplines,
		levels,
		options,
		requirementCreationSchema,
		types,
		type RequirementCreationSchema
	} from '$lib/schemas/requirement';
	import { advisorSchema, type AdvisorSchema } from '$lib/schemas/user';
	import { toast } from 'svelte-sonner';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let {
		data,
		courses,
		faculties
	}: {
		data: SuperValidated<Infer<RequirementCreationSchema>>;
		courses: { id: string; code: string; name: string }[];
		faculties: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(requirementCreationSchema)
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
							goto(`/disciplines/requirements/show/${$message.id}`);
						}
					}
				});
			}
		}
	});
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Add a requirement</Card.Title>
		<Card.Description
			>Enter the requirement details below to create a requirement for disciplines</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
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
			<Form.Button class="w-full" type="submit">Submit</Form.Button>
		</form>
	</Card.Content>
</Card.Root>
