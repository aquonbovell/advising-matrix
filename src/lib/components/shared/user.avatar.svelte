<script lang="ts">
	import { page } from '$app/stores';

	let name: string = $page.data.user.name;
	let { size }: { size: string } = $props();

	function getSizes(size: string = 'md'): string | undefined {
		const sizes: { [key: string]: string } = {
			sm: 'h-8 w-8',
			md: 'h-10 w-10',
			lg: 'h-20 w-20'
		};

		return sizes[size] || sizes['md'];
	}
</script>

<div
	class={`relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 ${getSizes(
		size
	)}`}
>
	<span class=" absolute font-semibold uppercase leading-none"
		>{name === undefined ? 'A' : name.charAt(0)}</span
	>
</div>
