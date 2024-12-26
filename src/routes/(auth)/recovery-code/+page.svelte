<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Button from '$lib/components/ui/button/index.js';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<Card.Root class="mx-auto max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Recovery Code</Card.Title>
			<Card.Description
				>You can use this recovery code if you lose access to your second factors.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<p>Your recovery code is: {data.recoveryCode}</p>
			<Button.Root class="mt-4" href="/dashboard">Next</Button.Root>
		</Card.Content>
	</Card.Root>
</div>
