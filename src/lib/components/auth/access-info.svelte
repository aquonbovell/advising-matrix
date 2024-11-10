<!-- Access.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
</script>

<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
	<Card.Header class="text-center">
		<img src={'/uwi_banner.png'} alt="UWI Banner" />
		<Card.Title class="text-2xl">Request Access</Card.Title>
		<Card.Description
			>To register for an account, you need an invitation from your advisor.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<p class="text-sm text-gray-700">Please follow these steps to gain access:</p>
			<ol class="list-inside list-decimal space-y-2 text-sm text-gray-700">
				<li>Contact your academic advisor</li>
				<li>Request an invitation to the registration system</li>
				<li>Your advisor will send you an invitation link via email</li>
				<li>Use the link in your email to complete the registration process</li>
			</ol>
		</div>
	</Card.Content>
	<Card.Footer class=" mt-4 justify-around text-center text-sm text-gray-600">
		<Button.Root
			href="/login"
			class="font-medium text-muted-foreground hover:underline"
			variant="link">Already have an account? Sign in</Button.Root
		>
	</Card.Footer>
</Card.Root>
<!-- Access.sevelte -->
