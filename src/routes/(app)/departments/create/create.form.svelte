<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import {
		departmentCreationSchema,
		type DepartmentCreationSchema
	} from './departmentCreation.schema';
	import { toast } from 'svelte-sonner';
	import Loader from 'lucide-svelte/icons/loader';

	let {
		data,
		faculties
	}: {
		data: SuperValidated<Infer<DepartmentCreationSchema>>;
		faculties: { id: string; name: string }[];
	} = $props();

	const form = superForm(data, {
		delayMs: 200,
		validators: zodClient(departmentCreationSchema),

		dataType: 'json'
	});

	const { form: formData, enhance, message, submitting } = form;

	$effect(() => {
		if ($message) {
			if ($message.type === 'success') {
				toast.success($message.message);
			} else {
				toast.error($message.message);
			}
		}
	});
	const triggerContent = $derived(
		faculties.find((f) => f.id === $formData.facultyId)?.name ?? 'Select a registered faculty'
	);
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Department Name</Form.Label>
				<Input {...props} bind:value={$formData.name} placeholder="BSC.." />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>
	<Form.Field {form} name="facultyId">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="font-semibold">Faculty Name</Form.Label>
				<Select.Root type="single" {...props} bind:value={$formData.facultyId} required>
					<Select.Trigger>
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Faculties</Select.GroupHeading>
							{#each faculties as faculty}
								<Select.Item value={faculty.id} label={faculty.name}>{faculty.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="mt-2 text-sm" />
	</Form.Field>

	<Form.Button disabled={$submitting} class=" text-base font-semibold">
		{#if $submitting}
			<Loader class="time animate-spin-slow" />
			<span>Please wait...</span>
		{:else}
			Create
		{/if}
	</Form.Button>
</form>
