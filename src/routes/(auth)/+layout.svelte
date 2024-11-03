<script lang="ts">
	import { setToastState } from '$lib/components/toast/toast-state.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';

	setToastState();
</script>

<Toast />

<div class="relative z-10 flex min-h-full min-w-80 items-center justify-center p-5 font-sans">
	<slot />
</div>
