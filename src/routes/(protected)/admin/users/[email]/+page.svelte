<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	export let form: ActionData;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{data.person?.name}</Card.Title>
		<Card.Description>{data.person?.email}</Card.Description>
		<p>Role: {data.person?.role}</p>
	</Card.Header>
	<Card.Content>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button
					class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-red-500 shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
					type="button">Reset Password</Button
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
