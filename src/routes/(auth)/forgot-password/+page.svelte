<script lang="ts">
	import type { PageData } from './$types';
	import ResetPasswordForm from './reset-password-form.svelte';
	import * as Card from '$lib/components/ui/card';

	export let data: PageData;
</script>

<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
	<Card.Header>
		<img src={'/uwi_banner.png'} alt="UWI Banner" />
		<Card.Title class="text-2xl">Reset your Password</Card.Title>
		<Card.Description
			>Enter your new password below to reset your account password.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<ResetPasswordForm data={data.form} />
	</Card.Content>
</Card.Root>
