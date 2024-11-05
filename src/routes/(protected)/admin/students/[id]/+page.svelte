<script lang="ts">
	import type { PageData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import EditForm from './edit-form.svelte';

	const toastState = getToastState();

	export let data: PageData;

	export let form: ActionData;

	$: if (form?.success) {
		alert('Password Reset was successfull');
		toastState.add('Notice', 'Password Reset was successfull', 'success');
	} else if (form?.message) {
		alert(form.message);
		toastState.add('Error', form.message, 'error');
	}
</script>

<div class="mx-auto max-w-2xl">
	<div class="flex items-center justify-between">
		<h1 class="font-bold">Edit student</h1>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button.Root variant="destructive" type="button">Delete</Button.Root></Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently delete the student from the system.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<form method="post" use:enhance>
						<Dialog.Close
							type="submit"
							formaction="?/delete"
							class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-red-500 shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
							>Delete Student</Dialog.Close
						>
					</form>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<EditForm data={data.form} majors={data.majors} minors={data.minors} advisors={data.advisors} />
</div>
