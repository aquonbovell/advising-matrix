<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import type { ActionData } from './$types';
	import PasswordRequirements from '$lib/components/PasswordRequirements.svelte';
	import { Button } from '$lib/components/ui/button';
	import { notifications } from '$lib/stores/notifications';

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

<div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
	<div class="mb-8 flex justify-center">
		<img src={uwiBanner} alt="UWI Banner" class="h-auto max-w-full" />
	</div>

	<h1 class="mb-2 text-center text-2xl font-semibold text-gray-800">Forgot Password</h1>
	<p class="mb-8 text-center text-sm text-gray-600">Reset your account password</p>

	<form method="POST" use:enhance class="space-y-4">
		<Input
			type="email"
			id="email"
			name="email"
			label="Official Email"
			placeholder="Enter your official email"
			error={form?.errors?.email}
		/>
		<Input
			type="email"
			id="alternate_email"
			name="alternate_email"
			label="Alternate Email"
			placeholder="Enter your alternate email"
			error={form?.errors?.alternate_email}
		/>
		<Input
			type="password"
			id="password"
			name="password"
			label="Password"
			placeholder="Enter your password"
			error={form?.errors?.password}
			bind:value={password}
		/>
		<Input
			type="password"
			id="confirm_password"
			name="confirm_password"
			label="Confirm Password"
			placeholder="Confirm your password"
			error={form?.errors?.confirm_password}
			bind:value={confirmPassword}
		/>
		<PasswordRequirements {password} {confirmPassword} />
		<Button
			type="submit"
			class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-black shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all disabled:cursor-not-allowed disabled:opacity-50"
			disabled={!isPasswordValid}
		>
			Continue
		</Button>
	</form>
	<div class="grid gap-3 py-2">
		<Button
			class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold text-black shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
			type="button"
		>
			<a href="/login"> Sign In </a>
		</Button>
	</div>
</div>
