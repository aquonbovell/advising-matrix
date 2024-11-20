<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import Update from './update.form.svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="mx-auto max-w-xl border-0 bg-inherit">
	<Card.Header>
		<Card.Title>Matrix Course - {data.form.data.name}</Card.Title>
		<Card.Description>Manage this course details and requirements</Card.Description>
	</Card.Header>
	<Card.Content>
		<Update data={data.form} courses={data.courses} departments={data.departments} />
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<AlertDialog.Root>
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
					<form method="POST" action="?/delete" use:enhance class="flex gap-2">
						<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
						<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
					</form>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</Card.Footer>
</Card.Root>
