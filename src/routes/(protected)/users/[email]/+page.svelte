<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import type { ActionData } from './$types';

	export let data: PageData;

	export let form: ActionData;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{data.person?.name}</Card.Title>
		<Card.Description>{data.person?.email}</Card.Description>
	</Card.Header>
	<Card.Content>
		<p>Role: {data.person?.role}</p>

		<Dialog.Root>
			<Dialog.Trigger class="rounded-lg bg-red-500 p-2 font-medium text-white"
				>Reset Password</Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently change this account credentials.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<form method="post">
						<Button type="submit" formaction="?/resetPassword">Reset Password</Button>
					</form>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
		{#if form?.success}
			<p class="text-green-500">Password Reset was successfull</p>
		{:else if form?.message}
			<p class="text-red-500">{form.message}</p>
		{/if}
	</Card.Content>
	<Card.Footer>
		<p>Faculty: Sci Tech</p>
	</Card.Footer>
</Card.Root>
