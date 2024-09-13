<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import type { ActionData, PageData } from './$types';
	import PasswordRequirements from '$lib/components/PasswordRequirements.svelte';
	import { Button } from '$lib/components/ui/button';
	import { notifications } from '$lib/stores/notifications';
	import ResetPasswordForm from './reset-password-form.svelte';
	import * as Card from '$lib/components/ui/card';

	export let data: PageData;
	export let form: ActionData;

	let password = '';
	let confirmPassword = '';

	$: isPasswordValid =
		password.length >= 8 &&
		/[A-Z]/.test(password) &&
		password === confirmPassword &&
		password !== '';
	$: {
		if (form?.errors) {
			const messages = Object.values(form.errors);

			for (let message of messages) {
				notifications.info(message, 5000);
			}
		}
	}
</script>

<Card.Root class="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
	<Card.Header>
		<img src={uwiBanner} alt="UWI Banner" />
		<Card.Title class="text-2xl">Reset your Password</Card.Title>
		<Card.Description
			>Enter your new password below to reset your account password.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<ResetPasswordForm data={data.form} />
	</Card.Content>
</Card.Root>
