<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/';
	import * as Button from '$lib/components/ui/button/';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Update from './update.form.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { buttonVariants } from '$lib/components/ui/button/';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let isOpen = $state(false);
</script>

<Card.Root class="mx-auto mb-4 max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between"
			>User - {data.user?.name}
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
										toast.success('Student deleted successfully', { duration: 2000 });
									} else {
										isOpen = false;
										toast.error('An error occurred', { duration: 2000 });
									}
									await applyAction(result);
									setTimeout(() => {
										goto('/students', { replaceState: true });
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
			</AlertDialog.Root></Card.Title
		>
		<Card.Description>Manage this user account settings</Card.Description>
	</Card.Header>
	<Card.Content>
		<Update
			data={data.form}
			majors={data.majors}
			minors={data.minors}
			user={data.user}
			advisors={data.advisors}
		/>
	</Card.Content>
</Card.Root>
