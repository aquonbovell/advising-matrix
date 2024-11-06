<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { courseSchema, type CourseSchema } from './schema.js';
	import { Button } from '$lib/components/ui/button';
	import { ChevronsUpDown, Check } from 'lucide-svelte';
	import { cn } from '$lib/utils.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { prerequisiteTypes } from '$lib/types.js';

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
					.filter((course) => $formData.prerequisites.courses.includes(course.id))
					.map((course) => course.name),
				value: $formData.prerequisites.courses
			}
		: undefined;
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Course Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="Human Anatomy" readonly />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-12">
		<Form.Field {form} name="code" class="lg:col-span-4">
			<Form.Control let:attrs>
				<Form.Label class="font-semibold">Course Code</Form.Label>
				<Input {...attrs} bind:value={$formData.code} placeholder="PHIL2406" readonly />
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
					readonly
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
					<Select.Trigger {...attrs} class="min-w-max">
						<Select.Value placeholder="Select a verified department" />
					</Select.Trigger>
				</Select.Root>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="comment">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Comment</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.comment}
				readonly
				placeholder="Course restrictions and disclaimers"
			/>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="levelRestriction">
		<Form.Control let:attrs>
			<div class="flex items-baseline justify-between">
				<Form.Label class="font-semibold">Course Level Restriction</Form.Label>
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
							>
								<Select.Trigger>
									<Select.Value placeholder="Select a verified level" />
								</Select.Trigger>
							</Select.Root>
						</div>

						<!-- Credits Input -->
						<div class="col-span-2 w-full">
							<Form.Label class="font-semibold">Credits</Form.Label>
							<Input value={restriction.credits} type="number" readonly />
						</div>

						<!-- Area Input -->
						<div class="col-span-full w-full sm:col-span-6">
							<Form.Label class="font-semibold">Area</Form.Label>
							<Input bind:value={restriction.area} type="text" readonly />
						</div>
					</div>
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
				{#each prerequisiteTypes as option}
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value={option} id={option} />
						<Label for={option}
							>{option.slice(0, 1).toUpperCase() + option.slice(1).toLowerCase()} of the following</Label
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
							No course
						{/if}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button></Popover.Trigger
				>
			</Popover.Root>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
</form>
