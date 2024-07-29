<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/assets/img/404-error.jpg';
</script>

<div class="container grid grid-rows-2 justify-center">
	<img src={logo} alt="404" width="450" class="mx-auto" />

	<div class="flex flex-col gap-2 text-center">
		<h3 class="text-2xl font-bold">Oops! It's a Cosmic Error</h3>

		<a href="/" class=" rounded-md bg-blue-500 px-3 py-4">Go back to Dashboard</a>
		<p class="text-balance">
			The page you were searching for seems to have taken a detour into deep space. But don't worry,<br
			/>
			we're here to nagivate you back safety.
		</p>
	</div>
</div>
