<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import type { ActionData } from './$types';
	import PasswordRequirements from '$lib/components/PasswordRequirements.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from 'bits-ui';

	export let form: ActionData;

	let password = '';
	let confirmPassword = '';

	$: isPasswordValid =
		password.length >= 8 &&
		/[A-Z]/.test(password) &&
		password === confirmPassword &&
		password !== '';
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] font-sans"
>
	<div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
		<div class="mb-8 flex justify-center">
			<img src={uwiBanner} alt="UWI Banner" class="h-auto max-w-full" />
		</div>

		<h1 class="mb-2 text-center text-2xl font-semibold text-gray-800">Forgot Password</h1>
		<p class="mb-8 text-center text-sm text-gray-600">Reset your account password</p>

		{#if form?.errors?.user}
			<Alert.Root class="text-red-600">
				<!-- <Terminal class="h-4 w-4" /> -->
				<Alert.Title>Heads up!</Alert.Title>
				<Alert.Description>{form?.errors?.user}</Alert.Description>
			</Alert.Root>
		{/if}

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
			<button
				type="submit"
				class="w-full rounded-md border bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!isPasswordValid}
			>
				Submit
			</button>
		</form>
		<div class="grid gap-3 py-2">
			<Button.Root
				class="inline-flex h-12 w-full items-center justify-center rounded-lg border bg-slate-50 px-[21px] text-[15px] font-semibold shadow-sm hover:bg-slate-100/95 active:scale-90 active:transition-all"
				type="button"
				href="/auth/sign-in"
			>
				Sign In
			</Button.Root>
		</div>
	</div>
</div>
