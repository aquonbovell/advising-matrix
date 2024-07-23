<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string = '';
	export { className as class };
</script>

<div
	class={cn(
		'spinner animate-stall-spin inline rounded-full border-2 border-white/60 border-t-white text-white',
		className
	)}
/>

<style>
	.animate-stall-spin {
		animation: stall-spin 0.9s cubic-bezier(0.4, 0, 0.7, 1) infinite;
	}

	@keyframes stall-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
