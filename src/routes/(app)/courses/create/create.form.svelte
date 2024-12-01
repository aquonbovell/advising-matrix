<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		courseCreationSchema,
		prerequisiteOptions,
		type CourseCreationSchema
	} from './courseCreation.schema';
	import disciplines from '$lib/data/disciplines.json';
	import { toast } from 'svelte-sonner';
	import Loader from 'lucide-svelte/icons/loader';

	let {
		data,
		courses,
		departments
	}: {
		data: SuperValidated<Infer<CourseCreationSchema>>;
		courses: { id: string; name: string; code: string }[];
		departments: { id: string; name: string }[];
	} = $props();
	const form = superForm(data, {
		validators: zodClient(courseCreationSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message, allErrors, errors, submitting } = form;

	$effect(() => {
		if ($message) {
			if ($message.type === 'success') {
				toast.success($message.message);
			} else {
				toast.error($message.message);
			}
		}
	});

	const levels = Array.from({ length: 3 }, (_, i) => {
		return { label: `Level ${i + 1}`, value: (i + 1).toString() };
	});

	const triggerContent = $derived(
		departments.find((d) => d.id === $formData.departmentId)?.name ??
			'Select a registered department'
	);
	const prerequisites = $derived(
		courses.filter((c) => $formData.prerequisites.includes(c.id)).length > 0
			? courses.filter((c) => $formData.prerequisites.includes(c.id)).map((c) => c.name)
			: 'Select from registered courses'
	);

	function addRestriction() {
		$formData.restrictions = [
			...$formData.restrictions,
			{
				id: crypto.randomUUID(),
				area: [],
				credits: 0,
				level: []
			}
		];
	}
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Course Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Human Anatomy..." />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<div class="grid w-full grid-cols-4 gap-4 md:grid-cols-3">
		<Form.Field {form} name="code" class="col-span-4 md:col-auto">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="font-semibold">Course Code</Form.Label>
					<Input {...props} bind:value={$formData.code} placeholder="HUAN1234..." />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
		<Form.Field {form} name="credits" class="col-span-2 md:col-auto">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="font-semibold">Course Credits</Form.Label>
					<Input {...props} bind:value={$formData.credits} type="number" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
		<Form.Field {form} name="level" class="col-span-2 md:col-auto">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="font-semibold">Course Level</Form.Label>
					<Select.Root
						type="single"
						bind:value={$formData.level}
						onValueChange={(value) => {
							$formData.level = parseInt(value);
						}}
						{...props}
						required
					>
						<Select.Trigger>
							{levels.find((l) => l.value == $formData.level?.toString())?.label ??
								'Select a verified level to display'}
						</Select.Trigger>
						<Select.Content>
							{#each levels as level}
								<Select.Item value={level.value} label={level.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
	</div>
	<Form.Field {form} name="departmentId">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Department Name</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.departmentId} required>
					<Select.Trigger>
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Faculties</Select.GroupHeading>
							{#each departments as department}
								<Select.Item value={department.id} label={department.name}
									>{department.name}</Select.Item
								>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="comment">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Course Comments / Warnings</Form.Label>
				<Input {...props} bind:value={$formData.comment} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<div class="grid grid-cols-1 md:grid-cols-2">
		<Form.Field {form} name="prerequisiteType">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="font-semibold">Type of prerequisite</Form.Label>
					<RadioGroup.Root
						{...props}
						bind:value={$formData.prerequisiteType}
						class="flex flex-col space-y-1"
						name="prerequisiteType"
					>
						{#each prerequisiteOptions as option}
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
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
		<Form.Field {form} name="prerequisiteCount">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="font-semibold">Course Prerequisite Amount</Form.Label>
					<Input {...props} bind:value={$formData.prerequisiteCount} type="number" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
	</div>

	<Form.Field {form} name="prerequisites">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Prerequisites</Form.Label>
				<Select.Root type="multiple" {...props} bind:value={$formData.prerequisites}>
					<Select.Trigger class="flex  w-full flex-wrap justify-start gap-2">
						{#if prerequisites === 'Select from registered courses'}
							{prerequisites}
						{:else}
							{#each prerequisites as prerequisite}
								<Badge>{prerequisite}</Badge>
							{/each}
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Courses</Select.GroupHeading>
							{#each courses as course}
								<Select.Item value={course.id} label={course.name}>{course.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<div class="flex items-center justify-between">
		<h3 class="font-semibold">Level Restrictions</h3>
		<Button.Root variant="secondary" onclick={addRestriction} class="w-fit"
			>Add Restriction</Button.Root
		>
	</div>
	{#each $formData.restrictions as restriction, i}
		<Form.Fieldset {form} name={`restrictions[${i}]`} class="space-y-3">
			<div class="flex items-center justify-between">
				<Form.Legend>Restriction {i + 1}</Form.Legend><Button.Root
					size="sm"
					variant="destructive"
					onclick={() =>
						($formData.restrictions = $formData.restrictions.filter((_, index) => index !== i))}
					><Icon icon="mdi-light:delete" width="1.2rem" height="1.2rem" /></Button.Root
				>
			</div>

			<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
				<Form.Field {form} name={`restrictions[${i}].level`}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label for={restriction.id}>Level</Form.Label>
							<Select.Root
								type="multiple"
								{...props}
								required
								value={restriction.level.map((l) => l.toString())}
								onValueChange={(value) => {
									restriction.level = value.map((v) => parseInt(v));
								}}
								name={`restrictions[${i}].level`}
							>
								<Select.Trigger>
									{restriction.level.length > 0
										? levels
												.filter((l) => restriction.level.includes(parseInt(l.value)))
												.map((l) => l.label)
												.join(', ')
										: 'Select a verified level to display'}
								</Select.Trigger>
								<Select.Content>
									{#each levels as level}
										<Select.Item value={level.value} label={level.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="mt-2 text-sm" />
				</Form.Field>
				<Form.Field {form} name={`restrictions[${i}].credits`}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label for={restriction.id}>Credits</Form.Label>
							<Input
								value={restriction.credits}
								onblur={(value) => {
									restriction.credits = parseInt(value.currentTarget.value);
								}}
								{...props}
							/>
						{/snippet}
					</Form.Control>

					<Form.FieldErrors class="mt-2 text-sm" />
				</Form.Field>
				<Form.Field {form} name={`restrictions[${i}].area`}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label for={restriction.id}>Discipline</Form.Label>
							<Select.Root
								type="multiple"
								{...props}
								bind:value={restriction.area}
								name={`restrictions[${i}].area`}
							>
								<Select.Trigger>
									{restriction.area.length > 0
										? disciplines.filter((d) => restriction.area.includes(d)).join(', ')
										: 'Select a verified discipline to display'}
								</Select.Trigger>
								<Select.Content>
									{#each disciplines as discipline}
										<Select.Item value={discipline} label={discipline} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="mt-2 text-sm" />
				</Form.Field>
			</div>
		</Form.Fieldset>
	{/each}

	<Form.Button disabled={$submitting} class="text-base font-semibold">
		{#if $submitting}
			<Loader class="time animate-spin-slow" />
			<span>Please wait...</span>
		{:else}
			Create
		{/if}
	</Form.Button>
</form>
