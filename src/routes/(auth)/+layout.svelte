<script lang="ts">
	import { setToastState } from '$lib/components/toast/toast-state.svelte';
	import Toast from '$lib/components/toast/Toast.svelte';

	setToastState();
</script>

<Toast />
<div
	class="flex min-h-full min-w-80 items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] p-5 font-sans"
>
	<slot />
</div>
