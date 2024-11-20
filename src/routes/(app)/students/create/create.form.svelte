<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { studentCreationSchema, type StudentCreationSchema } from './studentCreation.schema';
	import User from '$lib/components/shared/user.avatar.svelte';

	let {
		data,
		users,
		advisors,
		majors,
		minors
	}: {
		data: SuperValidated<Infer<StudentCreationSchema>>;
		users: { name: string; id: string }[];
		advisors: { name: string; id: string }[];
		majors: { name: string; id: string }[];
		minors: { name: string; id: string }[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(studentCreationSchema)
	});

	const { form: formData, enhance, message } = form;

	const student = $derived(
		users.find((u) => u.id === $formData.userId)?.name ?? 'Select a registered user'
	);
	const major = $derived(
		majors.find((u) => u.id === $formData.majorId)?.name ?? 'Select a registered major'
	);
	const minor = $derived(
		[...majors, ...minors].find((u) => u.id === $formData.minorId)?.name ??
			'Select a registered major or minor'
	);
	const advisorIds = $derived(
		advisors.filter((u) => $formData.advisors.includes(u.id)).length > 0
			? advisors
					.filter((u) => $formData.advisors.includes(u.id))
					.map((u) => u.name)
					.join(', ')
			: 'Select a registered user'
	);
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="userId">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Student</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.userId}>
					<Select.Trigger>
						{student}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Users</Select.GroupHeading>
							{#each users as user}
								<Select.Item value={user.id} label={user.name}>{user.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="advisors">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Advisors</Form.Label>
				<Select.Root type="multiple" {...props} bind:value={$formData.advisors}>
					<Select.Trigger>
						{advisorIds}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Advisors</Select.GroupHeading>
							{#each advisors as advisor}
								<Select.Item value={advisor.id} label={advisor.name}>{advisor.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="majorId">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">First Major</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.majorId}>
					<Select.Trigger>
						{major}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Majors</Select.GroupHeading>
							{#each majors as major}
								<Select.Item value={major.id} label={major.name}>{major.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="minorId">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Second Major / First Minor</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.minorId}>
					<Select.Trigger>
						{minor}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Majors</Select.GroupHeading>
							{#each majors as major}
								<Select.Item value={major.id} label={major.name}>{major.name}</Select.Item>
							{/each}
						</Select.Group>
						<Select.Group>
							<Select.GroupHeading>Minors</Select.GroupHeading>
							{#each minors as minor}
								<Select.Item value={minor.id} label={minor.name}>{minor.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<!--<Form.Field {form} name="alternateEmail">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Alternate Email</Form.Label>
				<Input
					{...props}
					bind:value={$formData.alternateEmail}
					placeholder="example@outlook.components"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Field {form} name="role">
		<Form.Control>
			{#snippet children({ props })}
				<RadioGroup.Root bind:value={$formData.role} {...props} class="flex">
					{#each userOptions as option}
						<div class="flex flex-row items-center space-x-2">
							<RadioGroup.Item value={option} id={option} />
							<Label for={option}>{option}</Label>
						</div>
					{/each}
				</RadioGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field> -->

	<Form.Button type="submit">Create</Form.Button>
</form>
