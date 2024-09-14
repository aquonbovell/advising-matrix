<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { Badge } from '$lib/components/ui/badge';

	const toastState = getToastState();

	export let data: PageData;

	export let form: ActionData;

	$: if (form?.success) {
		toastState.add('Notice', 'Password Reset was successfull', 'success');
	} else if (form?.message) {
		toastState.add('Error', form.message, 'error');
	}
</script>

<Card.Root class="mx-auto max-w-md">
	<Card.Header>
		<Card.Title class="flex items-center gap-4"
			><span>{data.person.name} </span><Badge>{data.person.role}</Badge></Card.Title
		>
		<Card.Description>Email: {data.person.email}</Card.Description>
		<Card.Description>Alterate Email:{data.person.alternate_email}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button.Root variant="destructive" type="button">Reset Password</Button.Root
				></Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently change this account credentials.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<form method="post" use:enhance>
						<Dialog.Close
							type="submit"
							formaction="?/resetPassword"
							class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-red-500 shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
							>Reset Password</Dialog.Close
						>
					</form>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Content>
</Card.Root>
