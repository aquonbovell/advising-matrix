<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { type StudentSchema, studentSchema } from './schema.js';

	export let data: SuperValidated<Infer<StudentSchema>>;

	export let majors: { id: string; name: string }[];

	export let minors: { id: string; name: string }[];

	export let advisors: { id: string; name: string }[];

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(studentSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message } = form;

	$: {
		if ($message) {
			alert($message);
		}
	}

	$: selectedMajor = $formData.majorId
		? {
				label: majors.find((major) => major.id === $formData.majorId)?.name,
				value: $formData.majorId
			}
		: undefined;
	$: selectedMinor = $formData.minorId
		? {
				label: minors.find((minor) => minor.id === $formData.minorId)?.name,
				value: $formData.minorId
			}
		: undefined;
	$: selectedAdvisor = $formData.advisors.map((advisorId) => {
		return {
			label: advisors.find((advisor) => advisor.id === advisorId)?.name,
			value: advisorId
		};
	});
</script>

<form method="POST" use:enhance class="space-y-4" action="?/edit">
	<Form.Field {form} name="userId">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold" hidden>User</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="John Doe..." type="hidden" />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">User</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder="John Doe..." disabled />
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="advisors">
		<Form.Control let:attrs>
			<Form.Label class="font-semibold">Advisors</Form.Label>
			<Select.Root
				multiple
				selected={selectedAdvisor}
				onSelectedChange={(v) => {
					v && ($formData.advisors = v.map((advisor) => advisor.value));
				}}
			>
				<Select.Trigger {...attrs}>
					<Select.Value placeholder="Select a registered user" />
				</Select.Trigger>
				<Select.Content>
					{#each advisors as advisor}
						<Select.Item value={advisor.id} label={advisor.name} />
					{/each}
				</Select.Content>
			</Select.Root>
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<div class="flex gap-4">
		<Form.Field {form} name="majorId" class="w-full">
			<Form.Control let:attrs>
				<Form.Label class="font-semibold">Major</Form.Label>
				<Select.Root
					selected={selectedMajor}
					onSelectedChange={(v) => {
						v && ($formData.majorId = v.value);
					}}
				>
					<Select.Trigger {...attrs}>
						<Select.Value placeholder="Select a verified major" />
					</Select.Trigger>
					<Select.Content>
						{#each majors as major}
							<Select.Item value={major.id} label={major.name} />
						{/each}
					</Select.Content>
				</Select.Root>
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
		<Form.Field {form} name="majorId" class="w-full">
			<Form.Control let:attrs>
				<Form.Label class="font-semibold">Minor</Form.Label>
				<Select.Root
					selected={selectedMinor}
					onSelectedChange={(v) => {
						v && ($formData.minorId = v.value);
					}}
				>
					<Select.Trigger {...attrs}>
						<Select.Value placeholder="Select a verified minor" />
					</Select.Trigger>
					<Select.Content>
						{#each minors as minor}
							<Select.Item value={minor.id} label={minor.name} />
						{/each}
					</Select.Content>
				</Select.Root>
			</Form.Control>
			<Form.FieldErrors class="mt-2 text-sm" />
		</Form.Field>
	</div>
	<Form.Button type="submit">Update</Form.Button>
</form>
