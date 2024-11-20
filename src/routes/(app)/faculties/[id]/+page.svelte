<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/';
	import * as Label from '$lib/components/ui/label';
	import * as Input from '$lib/components/ui/input/';
	import * as Button from '$lib/components/ui/button/';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Checkbox from '$lib/components/ui/checkbox/';
	import { buttonVariants } from '$lib/components/ui/button/';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
</script>

<Card.Root class="mx-auto max-w-xl border-0 bg-inherit">
	<Card.Header>
		<Card.Title>{data.faculty.name}</Card.Title>
		<Card.Description>Manage this faculty details</Card.Description>
	</Card.Header>
	<Card.Content>
		<form>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="name">Name</Label.Root>
					<Input.Root
						id="name"
						placeholder="Science & Technology"
						readonly
						value={data.faculty.name}
					/>
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<Button.Root variant="outline" href={`/faculties/${data.faculty.id}/edit`}>Edit</Button.Root>
		<AlertDialog.Root>
			<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
				Delete
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. This will permanently delete this record from our servers.
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
