<script lang="ts">
	import { Button } from './ui/button';

	export let buttonProps = {};

	let className: string =
		'flex w-max px-3 py-1 text-sm text-white bg-blue-700 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

	if ($$restProps.class) {
		className += ` ${$$restProps.class}`;
	}
</script>

<Button class={className} {...buttonProps}>
	<slot />
</Button>
