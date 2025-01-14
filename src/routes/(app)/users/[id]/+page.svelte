<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/';
	import * as Label from '$lib/components/ui/label';
	import * as Input from '$lib/components/ui/input/';
	import * as Button from '$lib/components/ui/button/';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Checkbox from '$lib/components/ui/checkbox/';
	import { buttonVariants } from '$lib/components/ui/button/';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let isOpen = $state(false);
</script>

<Card.Root class="glass mx-auto mb-4  max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title>User - {data.person.name}</Card.Title>
		<Card.Description>Manage this user account details</Card.Description>
	</Card.Header>
	<Card.Content>
		<form>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="name">Name</Label.Root>
					<Input.Root id="name" placeholder="Jane Doe" readonly bind:value={data.person.name} />
				</div>

				<div class="flex flex-col space-y-1.5">
					<Label.Root for="username">Username</Label.Root>
					<Input.Root
						id="username"
						placeholder="janedoe"
						readonly
						bind:value={data.person.username}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="email">Email</Label.Root>
					<Input.Root
						id="email"
						placeholder="example@mycavehill.uwi.edu"
						type="email"
						readonly
						bind:value={data.person.email}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="alternateEmail">Alternate Email</Label.Root>
					<Input.Root
						id="alternateEmail"
						placeholder="example@outlook.com"
						readonly
						type="email"
						bind:value={data.person.alternateEmail}
					/>
				</div>
				<div class="flex flex-row items-center gap-2 space-y-1.5">
					<Label.Root for="onboarded">Onboarded</Label.Root>
					<Checkbox.Root
						class="pointer-events-none"
						id="onboarded"
						checked={data.person.onboarded ? true : undefined}
						disabled
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="role">Role</Label.Root>
					<Input.Root id="role" placeholder="Student" readonly bind:value={data.person.role} />
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		{#if data.user?.role === 'ADMIN'}
			<Button.Root variant="outline" href={`/users/${data.person.id}/edit`}>Edit</Button.Root>
		{/if}
		{#if data.user?.role === 'ADMIN'}
			<AlertDialog.Root bind:open={isOpen}>
				<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
					Delete
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently delete the account and remove the
							data from our servers.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ result }) => {
									// `result` is an `ActionResult` object

									if (result.type === 'failure') {
										isOpen = false;
										toast.error(result.data?.message as string, { duration: 2000 });
									} else if (result.type === 'success') {
										isOpen = false;
										toast.success('User deleted successfully', { duration: 2000 });
									} else {
										isOpen = false;
										toast.error('An error occurred', { duration: 2000 });
									}
									await applyAction(result);
									setTimeout(() => {
										goto('/users', { replaceState: true });
									}, 2000);
								};
							}}
							class="flex gap-2"
						>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
						</form>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</Card.Footer>
</Card.Root>
