<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/';
	import * as Button from '$lib/components/ui/button/';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/';
	import { enhance } from '$app/forms';
	import View from './view.form.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="mx-auto max-w-xl border-0 bg-inherit">
	<Card.Header>
		<Card.Title>Matrix Course - {data.course.name}</Card.Title>
		<Card.Description>Manage this course details and requirements</Card.Description>
	</Card.Header>
	<Card.Content>
		<View {data} />
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<Button.Root variant="outline" href={`/courses/${data.course.id}/edit`}>Edit</Button.Root>
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
