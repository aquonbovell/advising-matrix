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
		<Card.Title
			>Matrix Student - {data.student.role[0] +
				data.student.role.substring(1).toLowerCase()}</Card.Title
		>
		<Card.Description>Manage this user account settings</Card.Description>
	</Card.Header>
	<Card.Content>
		<form>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="name">Name</Label.Root>
					<Input.Root id="name" placeholder="Jane Doe" readonly value={data.student.name} />
				</div>

				<div class="flex flex-col space-y-1.5">
					<Label.Root for="username">Username</Label.Root>
					<Input.Root id="username" placeholder="janedoe" readonly value={data.student.username} />
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="email">Email</Label.Root>
					<Input.Root
						id="email"
						placeholder="example@mycavehill.uwi.edu"
						type="email"
						readonly
						value={data.student.email}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="alternateEmail">Alternate Email</Label.Root>
					<Input.Root
						id="alternateEmail"
						placeholder="example@outlook.com"
						readonly
						type="email"
						value={data.student.alternateEmail}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="program">Program</Label.Root>
					<Input.Root
						id="program"
						placeholder="Bsc. Computer Science"
						readonly
						value={data.student.major + ', ' + data.student.minor + ', ' + data.student.major2}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="advisors">Advisors</Label.Root>
					<Input.Root
						id="advisors"
						placeholder="Advisor"
						readonly
						value={data.student.advisors.join(', ')}
					/>
				</div>

				<div class="flex flex-col space-y-1.5">
					<Label.Root for="role">Role</Label.Root>
					<Input.Root id="role" placeholder="Student" readonly value={data.student.role} />
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<Button.Root variant="outline" href={`/students/${data.student.id}/edit`}>Edit</Button.Root>
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
