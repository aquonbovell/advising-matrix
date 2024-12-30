<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { studentUpdateSchema, type StudentUpdateSchema } from '$lib/schemas/student';
	import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let {
		data,
		majors,
		minors
	}: {
		data: SuperValidated<Infer<StudentUpdateSchema>>;
		majors: {
			id: string;
			name: string;
		}[];
		minors: {
			id: string;
			name: string;
		}[];
	} = $props();

	const form = superForm(data, {
		validators: zodClient(studentUpdateSchema)
	});

	const { form: formData, enhance, message } = form;

	let isOpenUpdate = $state(false);

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
							goto(`/students/details/${$message.id}`);
						}
					}
				});
			}
		}
	});
</script>

<Card.Root class="mx-auto max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl">Edit Student Details</Card.Title>
		<Card.Description
			>Change the student details below to update an discipline for a student</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/edit" use:enhance>
			<Form.Field {form} name="id" hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Id</Form.Label>
						<Input.Root {...props} bind:value={$formData.id} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="userId" hidden>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>User Id</Form.Label>
						<Input.Root {...props} bind:value={$formData.userId} required type="text" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="majorId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Major</Form.Label>
						<Select.Root
							type="single"
							bind:value={() => {
								if ($formData.majorId == null) {
									return undefined;
								}
								return $formData.majorId;
							},
							(v) => {
								if (v === undefined) {
									$formData.majorId = null;
								} else {
									$formData.majorId = v;
								}
							}}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.majorId
									? majors.find((m) => m.id === $formData.majorId)?.name
									: 'Select verified majors to display'}
							</Select.Trigger>
							<Select.Content>
								{#each majors as major (major.id)}
									<Select.Item value={major.id} label={major.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed major.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="minorId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Minor</Form.Label>
						<Select.Root
							type="single"
							bind:value={() => {
								if ($formData.minorId == null) {
									return undefined;
								}
								return $formData.minorId;
							},
							(v) => {
								if (v === undefined) {
									$formData.minorId = null;
								} else {
									$formData.minorId = v;
								}
							}}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{$formData.minorId
									? minors.find((m) => m.id === $formData.minorId)?.name
									: 'Select verified minors to display'}
							</Select.Trigger>
							<Select.Content>
								{#each minors as minor (minor.id)}
									<Select.Item value={minor.id} label={minor.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>This is the public displayed minor.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-row space-x-1">
				<AlertDialog.Root bind:open={isOpenUpdate}>
					<AlertDialog.Trigger class={Button.buttonVariants({ class: 'w-full' })}>
						Update
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently change the account details and
								may prevent the user from accessing the account.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action
								type="submit"
								class={Button.buttonVariants({ variant: 'destructive' })}
								onclick={() => {
									isOpenUpdate = false;
								}}>Continue</AlertDialog.Action
							>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</form>
	</Card.Content>
</Card.Root>
