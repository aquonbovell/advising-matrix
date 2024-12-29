<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import { page } from '$app/state';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isOpen = $state(false);

	$effect(() => {
		if (form) {
			if (form.success === true) {
				toast.success('Department deleted successfully', {
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
						label: 'Ok',
						onClick: () => {
							goto(`/courses/departments`);
						}
					}
				});
			} else if (form.message) {
				toast.error(form.message, {
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
						label: 'Dismiss',
						onClick: () => {
							console.log('dismissed');
						}
					}
				});
			}
		}
	});
</script>

<div class="flex h-full w-full items-center justify-center px-4">
	<Card.Root class="mx-auto min-w-96 max-w-lg	">
		<Card.Header>
			<Card.Title class="text-2xl">Show Course</Card.Title>
			<Card.Description>Manage this course details</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label.Root for="name">Name</Label.Root>
					<Input.Root
						id="name"
						type="text"
						required
						readonly
						value={data.course.name}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="code">Code</Label.Root>
					<Input.Root
						id="code"
						type="text"
						required
						readonly
						value={data.course.code}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="description">Description</Label.Root>
					<Input.Root
						id="description"
						type="text"
						required
						readonly
						value={data.course.description}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="credits">Credits</Label.Root>
					<Input.Root
						id="credits"
						type="texts"
						required
						readonly
						value={data.course.credits}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="level">Level</Label.Root>
					<Input.Root
						id="level"
						type="text"
						required
						readonly
						value={data.course.level}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="department">Department Name</Label.Root>
					<Input.Root
						id="department"
						type="text"
						required
						readonly
						value={data.course.department}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="type">Type of prerequisite</Label.Root>
					<Input.Root
						id="type"
						type="text"
						required
						readonly
						value={data.course.prerequisiteType}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="prerequisites">Prerequisites</Label.Root>
					<Input.Root
						id="prerequisites"
						type="text"
						required
						readonly
						value={data.course.prerequisites.length === 0
							? 'No Prerequisites'
							: data.course.prerequisites.join('\n')}
						class="w-full"
					/>
				</div>

				<div class="flex flex-row space-x-1">
					<Button.Root type="button" href={`/courses/edit/${page.params.id}`} class="w-full"
						>Edit</Button.Root
					>
					<AlertDialog.Root bind:open={isOpen}>
						<AlertDialog.Trigger
							class={Button.buttonVariants({ variant: 'destructive', class: 'w-full' })}
						>
							Delete
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. This will permanently delete the course and remove
									the data from our servers.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<form
									method="POST"
									use:enhance={() => {
										isOpen = false;
										return async ({ result }) => {
											await applyAction(result);
										};
									}}
									class="flex gap-2"
								>
									<input type="text" hidden name="id" value={page.params.id} />
									<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										type="submit"
										class={Button.buttonVariants({ variant: 'destructive' })}
										>Continue</AlertDialog.Action
									>
								</form>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
