<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	let { data, form } = $props();
</script>

<Card.Root class="mx-auto max-w-md">
	<Card.Header>
		<Card.Title class="text-2xl">Email Verification</Card.Title>
		<Card.Description>
			<p class="inline-flex">
				We sent an 8-digit code to .<br /> Verify your email address below to access your account.
			</p>
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-3">
		<form method="POST" use:enhance action="?/verify" class="space-y-3">
			<InputOTP.Root maxlength={8} name="code" class="mx-auto w-fit">
				{#snippet children({ cells })}
					<InputOTP.Group>
						{#each cells.slice(0, 4) as cell}
							<InputOTP.Slot {cell} />
						{/each}
					</InputOTP.Group>
					<InputOTP.Separator />
					<InputOTP.Group>
						{#each cells.slice(4) as cell}
							<InputOTP.Slot {cell} />
						{/each}
					</InputOTP.Group>
				{/snippet}
			</InputOTP.Root>
			<Button.Root type="submit">Continue</Button.Root>
		</form>
		<form method="post" use:enhance action="?/resend">
			<Button.Root type="submit">Resend code</Button.Root>
			<p>{form?.resend?.message ?? ''}</p>
		</form>
	</Card.Content>
</Card.Root>
