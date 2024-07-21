<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export let rotation: string = '0deg';

	export { className as class };
</script>

<svg
	class={cn('size-4 flex-shrink-0', className)}
	style={`transform: rotate(${rotation}); transition: transform 0.2s ease-in-out; display: inline;`}
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg
>
