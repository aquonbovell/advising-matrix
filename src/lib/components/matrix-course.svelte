<script lang="ts">
	import { cn } from '$lib/utils';
	let {
		course
	}: {
		course: (string | undefined)[];
	} = $props();
</script>

<div class={cn('relative  @container')}>
	{course}
</div>
