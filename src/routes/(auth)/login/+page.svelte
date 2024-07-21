<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	// export let form;

	let loginError: string | undefined = undefined;
	let hasError = false;

	function handleSubmit(event: Event) {
		loginError = undefined;
		hasError = false;
	}

	// function handleEnhance() {
	// 	return ({ result }: any) => {
	// 		if (result.type === 'failure') {
	// 			if (typeof result.data?.message === 'string') {
	// 				loginError = result.data.message;
	// 			} else {
	// 				loginError = 'Login failed. Please check your credentials.';
	// 			}
	// 			hasError = true;
	// 		}
	// 	};
	// }
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] font-sans"
>
	<div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
		<div class="mb-8 flex justify-center">
			<img src={uwiBanner} alt="UWI Banner" />
		</div>

		<h1 class="mb-2 text-center text-2xl font-semibold text-gray-800">Welcome back</h1>
		<p class="mb-8 text-center text-sm text-gray-600">Please enter your details to sign in</p>

		{#if loginError}
			<div class="mb-4 rounded-md border border-red-400 bg-red-100 p-4 text-red-700">
				<p>{loginError}</p>
			</div>
		{/if}

		<form method="POST" on:submit={handleSubmit} use:enhance class="space-y-4">
			<Input
				type="email"
				id="email"
				name="email"
				label="Email address"
				placeholder="Enter your email"
				required
				{hasError}
			/>

			<Input
				type="password"
				id="password"
				name="password"
				label="Password"
				placeholder="Enter your password"
				required
				{hasError}
			/>

			<div class="flex items-center justify-center">
				<a href="/forgot-password" class="text-sm text-indigo-600 hover:underline"
					>Forgot password?</a
				>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>
				Sign in
			</button>
		</form>

		<p class="mt-6 text-center text-sm text-gray-600">
			Need access? <a href="/request-access" class="font-medium text-indigo-600 hover:underline"
				>Request here</a
			>
		</p>
	</div>
</div>
