<script lang="ts">
	import type { PageData } from './$types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import EditForm from './edit-form.svelte';
	import { enhance } from '$app/forms';

	export let data: PageData;
</script>

<div class="mx-auto max-w-2xl">
	<div class="flex items-center justify-between">
		<h1 class="font-bold">Edit Department</h1>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button.Root variant="destructive" type="button">Delete Department</Button.Root
				></Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently delete this faculty from the
						database.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<form method="post" use:enhance>
						<Dialog.Close
							type="submit"
							formaction="?/delete"
							class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-red-500 shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
							>Delete Department</Dialog.Close
						>
					</form>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<EditForm data={data.form} faculties={data.faculties} />
</div>
