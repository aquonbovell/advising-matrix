<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Label from '$lib/components/ui/label/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { roles } from '$lib/schemas/user';
	import { page } from '$app/state';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isOpen = $state(false);

	$effect(() => {
		if (form) {
			if (form.success === true) {
				toast.success('User deleted successfully', {
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
							goto(`/users/advisors`);
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
			<Card.Title class="text-2xl"
				>Identity - {data.identity.role.substring(0, 1).toUpperCase() +
					data.identity.role.substring(1)}</Card.Title
			>
			<Card.Description>Manage this user account details</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label.Root for="username">Username</Label.Root>
					<Input.Root
						id="username"
						type="text"
						required
						readonly
						value={data.identity.username}
						class="w-full"
					/>
				</div>
				<div class="grid gap-2">
					<Label.Root for="email">Email</Label.Root>
					<Input.Root
						id="email"
						type="email"
						required
						readonly
						value={data.identity.email}
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<legend class="text-sm font-normal">Select a role for the user...</legend>
					<RadioGroup.Root
						bind:value={data.identity.role}
						class="flex flex-col space-y-1"
						name="type"
					>
						{#each roles as role (role)}
							<div class="flex items-center space-x-3 space-y-0">
								<RadioGroup.Item value={role} />
								<Label.Root for="role" class="font-normal">{role}</Label.Root>
							</div>
						{/each}
					</RadioGroup.Root>
				</div>
				<div class="flex flex-row space-x-1">
					<Button.Root
						type="button"
						href={`/users/${data.identity.role}s/edit/${page.params.id}`}
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
									This action cannot be undone. This will permanently delete the account and remove
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
