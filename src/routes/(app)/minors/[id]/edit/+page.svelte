<script lang="ts">
	import type { PageData } from './$types';
	import Update from './update.form.svelte';
	import * as Card from '$lib/components/ui/card/';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	let { data }: { data: PageData } = $props();
	let isOpen = $state(false);
</script>

<Card.Root class="glass mx-auto mb-4 max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">
			Matrix Faculty - {data.form.data.name}
			{#if data.user?.role === 'ADMIN'}
				<AlertDialog.Root bind:open={isOpen}>
					<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
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
								action="?/delete"
								use:enhance={() => {
									return async ({ result }) => {
										// `result` is an `ActionResult` object

										if (result.type === 'failure') {
											isOpen = false;
											toast.error(result.data?.message as string, { duration: 2000 });
										} else if (result.type === 'success') {
											isOpen = false;
											toast.success('Minor deleted successfully', { duration: 2000 });
										} else {
											isOpen = false;
											toast.error('An error occurred', { duration: 2000 });
										}
										await applyAction(result);
										setTimeout(() => {
											goto('/minors', { replaceState: true });
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
			{/if}</Card.Title
		>
		<Card.Description>Manage this faculty details</Card.Description>
	</Card.Header>
	<Card.Content>
		<Update data={data.form} courses={data.courses} faculties={data.faculties} />
	</Card.Content>
</Card.Root>
