<!-- Access.svelte -->
<script lang="ts">
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] font-sans"
>
	<div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
		<div class="mb-8 flex justify-center">
			<img src={uwiBanner} alt="UWI Banner" />
		</div>

		<h1 class="mb-4 text-center text-2xl font-semibold text-gray-800">Request Access</h1>
		<p class="mb-6 text-center text-sm text-gray-600">
			To register for an account, you need an invitation from your advisor.
		</p>

		<div class="space-y-4">
			<p class="text-sm text-gray-700">Please follow these steps to gain access:</p>
			<ol class="list-inside list-decimal space-y-2 text-sm text-gray-700">
				<li>Contact your academic advisor</li>
				<li>Request an invitation to the registration system</li>
				<li>Your advisor will send you an invitation link via email</li>
				<li>Use the link in your email to complete the registration process</li>
			</ol>
		</div>

		<div class="mt-8 text-center">
			<a href="/login" class="text-sm font-medium text-indigo-600 hover:text-indigo-800">
				Already have an account? Sign in
			</a>
		</div>
	</div>
</div>
