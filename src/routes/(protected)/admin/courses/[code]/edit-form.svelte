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

	export let data: SuperValidated<Infer<CourseSchema>>;

	export let departments: { id: string; name: string }[];

	export let courses: { id: number; name: string }[];

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

	$: selectedPrerequisite = $formData.prerequisites.courses
		? {
				label: courses
					.filter((course) => $formData.prerequisites.courses.includes(course.id.toString()))
					.map((course) => course.name),
				value: $formData.prerequisites.courses
			}
		: undefined;
</script>

<form method="POST" use:enhance class="space-y-4" action="?/update">
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
	<div class="grid grid-cols-3 gap-3">
		<Form.Field {form} name="code">
			<Form.Control let:attrs>
				<Form.Label class="font-semibold">Course Code</Form.Label>
				<Input {...attrs} bind:value={$formData.code} placeholder="PHIL2406" />
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
		<Form.Field {form} name="credits">
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

		<Form.Field {form} name="departmentId">
			<Form.Control let:attrs>
				<Form.Label>Department</Form.Label>
				<Select.Root
					selected={selectedDepartment}
					onSelectedChange={(v) => {
						v && ($formData.departmentId = v.value);
					}}
				>
					<Select.Trigger {...attrs} class="min-w-max flex-1">
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
			<Form.Description class="max-w-[40ch]">
				Select a verified faculty from the list. If the department is not listed, please contact the
				administrator.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="levelRestriction">
		<Form.Control let:attrs>
			<div class="flex items-baseline justify-between">
				<Form.Label class="font-semibold">Course Level Restriction</Form.Label>
				<Button variant="outline" on:click={addRestriction} type="button">Add Restriction</Button>
			</div>

			{#each $formData.levelRestriction as restriction (restriction.id)}
				<div class="flex gap-3">
					<div class="flex w-full gap-3">
						<!-- Level Dropdown -->
						<Select.Root
							multiple
							selected={restriction.level.map((l) => ({ label: 'Level ' + l, value: l }))}
							onSelectedChange={(l) => {
								restriction.level = l?.map((v) => v.value) || [];
							}}
						>
							<Select.Trigger {...attrs} class="w-fit min-w-48">
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

						<!-- Credits Input -->
						<Input
							value={restriction.credits}
							class="w-fit"
							type="number"
							step="3"
							min="0"
							max="100"
							on:input={(event) => convertStringToNumber(event, restriction.id)}
						/>

						<!-- Area Input -->
						<Input
							bind:value={restriction.area}
							type="text"
							on:input={(event) => {
								updateArea(event, restriction.id);
							}}
						/>
					</div>
					<Button variant="outline" on:click={() => removeRestriction(restriction.id)} type="button"
						>Remove</Button
					>
				</div>
			{/each}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="prerequisites">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Prerequisites</Form.Label>
			<RadioGroup.Root
				class="flex gap-4"
				bind:value={$formData.prerequisites.dataType}
				onValueChange={(value) => {
					switch (value) {
						case 'all':
							$formData.prerequisites.requiredAmount = $formData.prerequisites.courses.length;
							break;

						case 'one':
							$formData.prerequisites.requiredAmount = 1;
							break;

						default:
							break;
					}
				}}
			>
				{#each prerequisiteOptions as option}
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value={option} id={option} />
						<Label for={option}
							>{option.slice(0, 1).toUpperCase() + option.slice(1)} of the following</Label
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
				<Popover.Content align="center" class="p-1">
					<Command.Root>
						<Command.Input placeholder="Search course..." />
						<Command.List class="max-h-48 p-0">
							<Command.Loading />
							<Command.Empty>No results found.</Command.Empty>
							<Command.Group>
								{#each courses as course}
									<Command.Item
										value={course.name}
										onSelect={(courseName) => {
											const cv = courses.find((c) => c.name === courseName)?.id.toString() || '';

											if ($formData.prerequisites.courses.includes(cv)) {
												$formData.prerequisites.courses = $formData.prerequisites.courses.filter(
													(c) => c !== cv
												);
											} else {
												$formData.prerequisites.courses = [...$formData.prerequisites.courses, cv];
											}
											switch ($formData.prerequisites.dataType) {
												case 'all':
													$formData.prerequisites.requiredAmount =
														$formData.prerequisites.courses.length;
													break;

												case 'one':
													$formData.prerequisites.requiredAmount = 1;
													break;

												default:
													break;
											}
										}}
									>
										<Check
											class={cn(
												'mr-2 h-4 w-4',
												!$formData.prerequisites.courses.includes(course.id.toString()) &&
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

	<Form.Button type="submit">Update</Form.Button>
</form>
