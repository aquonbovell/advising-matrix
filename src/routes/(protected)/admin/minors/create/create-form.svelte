<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { minorSchema, type MinorSchema } from './schema.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { options, requirementDetailsType, requirementOption, types } from '$lib/types.js';

	export let data: SuperValidated<Infer<MinorSchema>>;

	export let courses: { id: string; level: number; name: string; credits: number; code: string }[];
	export let faculties: { id: string; name: string }[];

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(minorSchema),
		dataType: 'json'
	});

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}
	const areas: {
		value: string;
		label: string;
	}[] = [];

	$: {
		courses.forEach((course) => {
			if (areas.find((area) => area.value === course.code.slice(0, 4))) {
				return;
			}
			areas.push({ value: course.code.slice(0, 4), label: course.code.slice(0, 4) });
		});
	}

	function addRequirement() {
		$formData.requirements = [
			...$formData.requirements,
			{
				id: crypto.randomUUID(),
				details: [],
				level: [],
				credits: 0,
				detailsType: 'COURSES',
				option: 'REQUIRED'
			}
		];
	}

	function changeDetailsType(value: string, id: string) {
		const requirement = $formData.requirements.find((r) => r.id === id);
		if (requirement) {
			requirement.details = [];
		}
		return value as requirementDetailsType;
	}
	function changeOption(value: string) {
		return value as requirementOption;
	}
	function removeRequirement(id: string) {
		$formData.requirements = $formData.requirements.filter((r) => r.id !== id);
	}
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Minor</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="Meterology..." />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="requirements">
		<Form.Control let:attrs>
			<div class="flex items-baseline justify-between">
				<Form.Label class="font-semibold">Minor Requirements</Form.Label>
				<Button variant="outline" on:click={addRequirement} type="button">Add Requirement</Button>
			</div>
			<div class="grid gap-3 md:grid-cols-2">
				{#each $formData.requirements as requirement, i}
					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<h1 class="text-base font-semibold">Requirement #{i + 1}</h1>
							<Button
								variant="outline"
								on:click={() => removeRequirement(requirement.id)}
								type="button">Remove</Button
							>
						</div>
						<div class="text-sm font-semibold">Details Type</div>
						<RadioGroup.Root
							bind:value={requirement.detailsType}
							class="flex gap-3"
							onValueChange={(value) =>
								(requirement.detailsType = changeDetailsType(value, requirement.id))}
						>
							{#each Object.values(types) as type}
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value={type} id={type} />
									<Label for={type}>{type.toLowerCase()}</Label>
								</div>
							{/each}
						</RadioGroup.Root>

						<div class="text-sm font-semibold">Type</div>
						<RadioGroup.Root
							bind:value={requirement.option}
							class="flex gap-3"
							onValueChange={(value) => {
								requirement.option = changeOption(value);
								switch (value) {
									case 'required':
										requirement.credits = courses
											.filter((c) => requirement.details.includes(c.id))
											.reduce((acc, curr) => acc + curr.credits, 0);
										break;
									case 'optional':
										requirement.credits = 3;
										break;
									default:
										break;
								}
							}}
						>
							{#each Object.values(options) as option}
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value={option} id={option} />
									<Label for={option}>{option.toLowerCase()}</Label>
								</div>
							{/each}
						</RadioGroup.Root>
						<div class="text-sm font-semibold">Levels</div>
						<Select.Root
							multiple
							selected={requirement.level.map((l) => ({ label: 'Level ' + l, value: l }))}
							onSelectedChange={(l) => {
								requirement.level = l?.map((v) => v.value) || [];
							}}
						>
							<Select.Trigger>
								<Select.Value placeholder="Select a verified level" />
							</Select.Trigger>
							<Select.Content class="min-w-48">
								{#each { length: 4 } as _, i}
									{#if i > 0}
										<Select.Item value={i} label={`Level ${i}`} />
									{/if}
								{/each}
							</Select.Content>
						</Select.Root>
						<div class="text-sm font-semibold">Credits</div>
						<Input bind:value={requirement.credits} type="number" placeholder="Credits" />

						<!-- Course Dropdown -->
						{#if requirement.detailsType === 'COURSES'}
							<div class="text-sm font-semibold">Courses Details</div>
							<Select.Root
								multiple
								selected={requirement.details.map((cv) => ({
									label: courses.find((c) => c.id == cv)?.name,
									value: cv
								}))}
								onSelectedChange={(cv) => {
									requirement.details = cv?.map((c) => c.value) || [];
									let credits = 0;
									switch (requirement.option) {
										case 'REQUIRED':
											credits = courses
												.filter((c) => requirement.details.includes(c.id))
												.reduce((acc, curr) => acc + curr.credits, 0);
											break;

										case 'OPTIONAL':
											credits = 3;
											break;

										default:
											break;
									}

									formData.update((data) => {
										return {
											...data,
											requirements: data.requirements.map((r) =>
												r.id === requirement.id ? { ...r, credits: credits } : r
											)
										};
									});
								}}
							>
								<Select.Trigger class="h-fit">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: courses.find((c) => c.id == cv)?.name, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										<Select.Value placeholder="Select courses" />
									{/if}
								</Select.Trigger>
								<Select.Content class="max-h-48 overflow-auto">
									{#each courses as course}
										<Select.Item value={course.id} label={course.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						{:else if requirement.detailsType === 'AREAS'}
							<div class="text-sm font-semibold">Area Details</div>
							<Select.Root
								multiple
								selected={requirement.details.map((cv) => ({
									label: areas.find((a) => a.value == cv)?.label,
									value: cv
								}))}
								onSelectedChange={(cv) => {
									requirement.details = cv?.map((c) => c.value) || [];
								}}
							>
								<Select.Trigger class="h-fit">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: areas.find((a) => a.value == cv)?.label, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										<Select.Value placeholder="Select an area..." />
									{/if}
								</Select.Trigger>
								<Select.Content class="max-h-48 overflow-auto">
									{#each areas as area}
										<Select.Item value={area.value} label={area.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						{:else if requirement.detailsType === 'FACULTIES'}
							<div class="text-sm font-semibold">Faculties Details</div>
							<Select.Root
								multiple
								selected={requirement.details.map((cv) => ({
									label: faculties.find((f) => f.id == cv)?.name,
									value: cv
								}))}
								onSelectedChange={(cv) => {
									requirement.details = cv?.map((c) => c.value) || [];
								}}
							>
								<Select.Trigger class="h-fit">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: faculties.find((f) => f.id == cv)?.name, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										<Select.Value placeholder="Select a faculty..." />
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
			<input type="hidden" bind:value={$formData.requirements} name="requirements" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button>Update</Form.Button>
</form>
