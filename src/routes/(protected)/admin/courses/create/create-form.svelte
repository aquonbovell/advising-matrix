<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { Input, type FormInputEvent } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { courseSchema, prerequisiteOptions, type CourseSchema } from './schema.js';
	import { Button } from '$lib/components/ui/button';
	import { ChevronsUpDown, Check } from 'lucide-svelte';
	import { cn, generateId } from '$lib/utils.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

	export let data: SuperValidated<Infer<CourseSchema>>;

	export let departments: { id: string; name: string }[];

	export let courses: { id: string; name: string }[];

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(courseSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}
	function updateArea(event: FormInputEvent, id: string) {
		const el = event.target as HTMLInputElement;
		const restrictionIndex = $formData.levelRestriction.findIndex((r) => r.id === id);
		if (restrictionIndex !== -1) {
			// Update the area directly in the form data
			$formData.levelRestriction[restrictionIndex]!.area = el.value.split(',');
		}
	}

	function addRestriction() {
		$formData.levelRestriction = [
			...$formData.levelRestriction,
			{
				id: generateId(),
				area: [],
				credits: 0,
				level: []
			}
		];
	}

	function removeRestriction(id: string) {
		$formData.levelRestriction = $formData.levelRestriction.filter((r) => r.id !== id);
	}

	function convertStringToNumber(event: FormInputEvent, id: string) {
		const el = event.target as HTMLInputElement;
		const restrictionIndex = $formData.levelRestriction.findIndex((r) => r.id === id);
		if (restrictionIndex !== -1) {
			// Update the area directly in the form data
			$formData.levelRestriction[restrictionIndex]!.credits = parseInt(el.value);
		}
	}

	$: selectedDepartment = $formData.departmentId
		? {
				label:
					departments[departments.findIndex((d) => d.id === $formData.departmentId)]?.name ||
					'Select a verified department',
				value: $formData.departmentId
			}
		: undefined;

	$: selectedPrerequisite = $formData.prerequisites
		? {
				label: courses
					.filter((course) => $formData.prerequisites.includes(course.id.toString()))
					.map((course) => course.name),
				value: $formData.prerequisites
			}
		: undefined;
</script>

<form method="POST" use:enhance class="space-y-4" action="?/create">
	<Form.Field {form} name="id">
		<Form.Control let:attrs>
			<Input {...attrs} bind:value={$formData.id} type="hidden" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Course Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="Human Anatomy" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-12">
		<Form.Field {form} name="code" class="lg:col-span-4">
			<Form.Control let:attrs>
				<Form.Label class="font-semibold">Course Code</Form.Label>
				<Input {...attrs} bind:value={$formData.code} placeholder="PHIL2406" />
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
		<Form.Field {form} name="credits" class="lg:col-span-4">
			<Form.Control let:attrs>
				<Form.Label class="font-semibold">Course Credits</Form.Label>
				<Input
					{...attrs}
					bind:value={$formData.credits}
					type="number"
					on:change={() => {
						$formData.credits = parseInt($formData.credits.toString());
					}}
				/>
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>

		<Form.Field {form} name="departmentId" class="col-span-full lg:col-span-4">
			<Form.Control let:attrs>
				<Form.Label>Department</Form.Label>
				<Select.Root
					selected={selectedDepartment}
					onSelectedChange={(v) => {
						v && ($formData.departmentId = v.value);
					}}
				>
					<Select.Trigger {...attrs}>
						<Select.Value placeholder="Select a verified department" />
					</Select.Trigger>
					<Select.Content>
						{#each departments as department}
							<Select.Item value={department.id} label={department.name} />
						{/each}
					</Select.Content>
				</Select.Root>
				<input hidden bind:value={$formData.departmentId} name={attrs.name} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="comment">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Comment</Form.Label>
			<Textarea
				{...attrs}
				bind:value={$formData.comment}
				placeholder="Course restrictions and disclaimers"
			/>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="levelRestriction">
		<Form.Control let:attrs>
			<div class="flex items-baseline justify-between">
				<Form.Label class="font-semibold">Course Level Restriction</Form.Label>
				<Button variant="outline" on:click={addRestriction} type="button">Add Restriction</Button>
			</div>

			{#each $formData.levelRestriction as restriction (restriction.id)}
				<div class="flex gap-3">
					<div class="relative grid w-full grid-cols-6 gap-3 pt-5 sm:grid-cols-12">
						<!-- Level Dropdown -->
						<div class="col-span-4 w-full">
							<Form.Label class="font-semibold">Level</Form.Label>
							<Select.Root
								multiple
								selected={restriction.level.map((l) => ({ label: 'Level ' + l, value: l }))}
								onSelectedChange={(l) => {
									restriction.level = l?.map((v) => v.value) || [];
								}}
							>
								<Select.Trigger {...attrs}>
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
						</div>

						<!-- Credits Input -->
						<div class="col-span-2 w-full">
							<Form.Label class="font-semibold">Credits</Form.Label>
							<Input
								value={restriction.credits}
								type="number"
								step="3"
								min="0"
								max="100"
								on:input={(event) => convertStringToNumber(event, restriction.id)}
							/>
						</div>

						<!-- Area Input -->
						<div class="col-span-full w-full sm:col-span-6">
							<Form.Label class="font-semibold">Area</Form.Label>
							<Input
								bind:value={restriction.area}
								type="text"
								on:input={(event) => {
									updateArea(event, restriction.id);
								}}
							/>
						</div>
						<button
							class="absolute right-0 top-0"
							on:click={() => removeRestriction(restriction.id)}
							type="button"
							><Badge class="bg-white px-2 py-1 font-bold text-destructive hover:bg-slate-200"
								>X</Badge
							></button
						>
					</div>
				</div>
			{/each}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="prerequisites">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Prerequisites</Form.Label>
			<RadioGroup.Root class="flex gap-4" bind:value={$formData.prerequisiteType}>
				{#each prerequisiteOptions as option}
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value={option} id={option} />
						<Label for={option}
							>{option.slice(0, 1) + option.slice(1).toLowerCase()} of the following</Label
						>
					</div>
				{/each}
			</RadioGroup.Root>

			<Popover.Root>
				<Popover.Trigger asChild let:builder
					><Button
						variant="outline"
						role="combobox"
						builders={[builder]}
						class="h-fit w-full justify-between"
					>
						{#if selectedPrerequisite && selectedPrerequisite.label.length > 0}
							<div class="flex flex-wrap justify-start gap-2">
								{#each selectedPrerequisite.label as label}
									<Badge>{label}</Badge>
								{/each}
							</div>
						{:else}
							Select a verified course
						{/if}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button></Popover.Trigger
				>
				<Popover.Content align="start" class="p-1">
					<Command.Root>
						<Command.Input placeholder="Search course..." />
						<Command.List class="max-h-52 p-0">
							<Command.Loading />
							<Command.Empty>No results found.</Command.Empty>
							<Command.Group>
								{#each courses as course}
									<Command.Item
										value={course.name}
										onSelect={(courseName) => {
											const cv = courses.find((c) => c.name === courseName)?.id.toString() || '';

											if ($formData.prerequisites.includes(cv)) {
												$formData.prerequisites = $formData.prerequisites.filter((c) => c !== cv);
											} else {
												$formData.prerequisites = [...$formData.prerequisites, cv];
											}
										}}
									>
										<Check
											class={cn(
												'mr-2 h-4 w-4',
												!$formData.prerequisites.includes(course.id.toString()) &&
													'text-transparent'
											)}
										/>
										{course.name}</Command.Item
									>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button type="submit">Create</Form.Button>
</form>
