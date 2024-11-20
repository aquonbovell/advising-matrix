<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import * as Button from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { majorCreationSchema, type MajorCreationSchema } from './majorCreation.schema';
	import { requirementOption, requirementType } from '$lib/types';
	import disciplines from './disciplines.json';
	import type { S } from 'vitest/dist/chunks/config.Cy0C388Z.js';
	let {
		data,
		courses,
		faculties
	}: {
		data: SuperValidated<Infer<MajorCreationSchema>>;
		courses: { id: string; name: string; code: string }[];
		faculties: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(majorCreationSchema),

		dataType: 'json'
	});

	const levels = Array.from({ length: 4 }, (_, i) => {
		return { label: `Level ${i + 1}`, value: i.toString() };
	});

	const { form: formData, enhance, message, allErrors } = form;

	$effect(() => {
		if ($message) {
			alert($message);
		}
	});

	function addRequirement() {
		$formData.requirements = [
			...$formData.requirements,
			{
				id: crypto.randomUUID(),
				type: requirementType.COURSES,
				option: requirementOption.ALL,
				level: [],
				credits: 0,
				details: []
			}
		];
	}

	function removeRequirement(id: string) {
		$formData.requirements = $formData.requirements.filter((r) => r.id !== id);
	}

	addRequirement();
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Major Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="Meterology..." />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="requirements">
		<Form.Control>
			<div class="flex items-center justify-between">
				<Form.Label class="font-semibold">Requirements</Form.Label>
				<Button.Root variant="outline" onclick={() => addRequirement()} type="button"
					>Add Requirement</Button.Root
				>
			</div>
			<div class="grid items-baseline justify-between gap-3 md:grid-cols-2">
				{#each $formData.requirements as requirement, i (requirement.id)}
					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<h1 class="text-sm font-semibold">Requirement #{i + 1}</h1>
							<Button.Root
								variant="outline"
								type="button"
								onclick={() => removeRequirement(requirement.id)}>Remove</Button.Root
							>
						</div>
						<div class="text-sm font-semibold">Details Type</div>
						<RadioGroup.Root bind:value={requirement.type} id={requirement.id} class="flex gap-3">
							{#each Object.values(requirementType) as type}
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value={type} />
									<Label for={type}>{type.toLowerCase()}</Label>
								</div>
							{/each}
						</RadioGroup.Root>

						<div class="text-sm font-semibold">Type</div>
						<RadioGroup.Root bind:value={requirement.option} class="flex gap-3">
							{#each Object.values(requirementOption) as option}
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value={option} />
									<Label for={option}>{option.toLowerCase()}</Label>
								</div>
							{/each}
						</RadioGroup.Root>
						<div class="text-sm font-semibold">Levels</div>
						<Select.Root
							type="multiple"
							value={requirement.level.map((l) => l.toString())}
							onValueChange={(value) => {
								requirement.level = value.map((v) => parseInt(v));
							}}
						>
							<Select.Trigger>
								{requirement.level.length > 0
									? requirement.level.map((l) => `Level ` + l)
									: 'Select a verified level'}
							</Select.Trigger>
							<Select.Content class="min-w-48">
								{#each levels as level, i}
									{#if i > 0}
										<Select.Item value={level.value} label={`Level ${i}`} />
									{/if}
								{/each}
							</Select.Content>
						</Select.Root>
						<div class="text-sm font-semibold">Credits</div>
						<Input bind:value={requirement.credits} type="number" placeholder="Credits" />

						<!-- Course Dropdown  -->
						{#if requirement.type === 'COURSES'}
							<div class="text-sm font-semibold">Courses Details</div>
							<Select.Root type="multiple" bind:value={requirement.details}>
								<Select.Trigger class="h-fit">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: courses.find((c) => c.id == cv)?.name, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										Select from verified courses...
									{/if}
								</Select.Trigger>
								<Select.Content class="max-h-48 overflow-auto">
									{#each courses as course}
										<Select.Item value={course.id} label={course.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						{:else if requirement.type === 'DISCIPLINES'}
							<div class="text-sm font-semibold">Discipline Details</div>
							<Select.Root type="multiple" bind:value={requirement.details}>
								<Select.Trigger class="h-fit">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: disciplines.find((d) => d == cv), value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										Select a verified discipline...
									{/if}
								</Select.Trigger>
								<Select.Content class="max-h-48 overflow-auto">
									{#each disciplines as discipline}
										<Select.Item value={discipline} label={discipline} />
									{/each}
								</Select.Content>
							</Select.Root>
						{:else if requirement.type === 'FACULTIES'}
							<div class="text-sm font-semibold">Faculties Details</div>
							<Select.Root type="multiple" bind:value={requirement.details}>
								<Select.Trigger class="h-fit">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: faculties.find((f) => f.id == cv)?.name, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										Select a verified faculty...
									{/if}
								</Select.Trigger>
								<Select.Content class="max-h-48 overflow-auto">
									{#each faculties as faculty}
										<Select.Item value={faculty.id} label={faculty.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/if}
					</div>
				{/each}
			</div>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button type="submit">Create</Form.Button>
</form>
