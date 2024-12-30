<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import * as TextArea from '$lib/components/ui/textarea/index.js';
	import { page } from '$app/state';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { disciplines } from '$lib/schemas/requirement';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isOpen = $state(false);

	$effect(() => {
		if (form) {
			if (form.success === true) {
				toast.success('Requirement deleted successfully', {
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
							goto(`/disciplines/requirements`);
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

<div class="flex h-screen w-full items-center justify-center px-4">
	<Card.Root class="mx-auto min-w-96 max-w-lg	">
		<Card.Header>
			<Card.Title class="text-2xl">Disciplines - Requirement</Card.Title>
			<Card.Description>Manage this requirement details</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label.Root for="type">type</Label.Root>
					<Input.Root
						id="type"
						type="text"
						required
						readonly
						value={data.requirement.type}
						class="w-full"
					/>
				</div>
				<div class="grid gap-2">
					<Label.Root for="option">option</Label.Root>
					<Input.Root
						id="option"
						type="text"
						required
						readonly
						value={data.requirement.option}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="level">level</Label.Root>
					<Input.Root
						id="level"
						type="text"
						required
						readonly
						value={data.requirement.level.length === 0
							? 'None'
							: data.requirement.level.map((l) => `Level ${l}`).join(', ')}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="credits">credits</Label.Root>
					<Input.Root
						id="credits"
						type="text"
						required
						readonly
						value={data.requirement.credits}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label.Root for="details">details</Label.Root>
					{#if data.requirement.type === 'courses'}
						<TextArea.Root
							id="details"
							required
							readonly
							value={data.courses
								.filter((c) => data.requirement.details.includes(c.id))
								.map((c) => c.name)
								.join('\n')}
						/>
					{:else if data.requirement.type === 'faculties'}
						<TextArea.Root
							id="details"
							required
							readonly
							value={data.faculties
								.filter((f) => data.requirement.details.includes(f.id))
								.map((f) => f.name)
								.join('\n')}
						/>
					{:else}
						<TextArea.Root
							id="details"
							required
							readonly
							value={disciplines.filter((d) => data.requirement.details.includes(d)).join('\n')}
						/>
					{/if}
				</div>
				<div class="flex flex-row space-x-1">
					<Button.Root
						type="button"
						href={`/disciplines/requirements/edit/${page.params.id}`}
						class="w-full">Edit</Button.Root
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
									This action cannot be undone. This will permanently delete the requirement and
									remove the data from our servers.
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
