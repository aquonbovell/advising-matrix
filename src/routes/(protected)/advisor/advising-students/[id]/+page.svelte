<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import StudentForm from './student-form.svelte';
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';
	import { goto } from '$app/navigation';
	export let data: PageData;

	const toastState = getToastState();

	export let form: ActionData;

	$: if (form?.success) {
		alert('Password Reset was successfull');
		toastState.add('Notice', 'Password Reset was successfull', 'success');
		goto('..');
	} else if (form?.message) {
		alert(form.message);
		toastState.add('Error', form.message, 'error');
	}
</script>

<div class="mx-auto max-w-fit">
	<div class="flex items-center justify-between">
		<h1 class=" font-bold">Student Details</h1>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button.Root variant="destructive" type="button">Delete Student</Button.Root
				></Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently remove this student from the system.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<form method="post" use:enhance>
						<Dialog.Close
							type="submit"
							formaction="?/delete"
							class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-red-500 shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
							>Delete</Dialog.Close
						>
					</form>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<StudentForm data={data.form} minors={data.minors} majors={data.majors} />
</div>
