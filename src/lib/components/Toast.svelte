<script>
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import moment from 'moment';
	import { notifications } from '$lib/stores/notifications'
	import Button from './ui/button/button.svelte';
</script>

<ol
	class="notifications absolute bottom-4 right-4
  flex max-h-96 flex-col gap-3 overflow-x-auto
"
>
	{#each $notifications as { id, message, timeout }, i (id)}
		<li class="flex gap-4 rounded-md border bg-white p-4" animate:flip transition:fly={{ y: 30 }}>
			<div class="grid gap-1">
				<div class=" text-sm font-semibold">Notice: {message}</div>
				<div class="text-sm opacity-90">{moment().format('dddd, MMMM D, YYYY [at] h:mm A')}</div>
			</div>
			<Button
				variant="outline"
				on:click={() => {
					notifications.remove(id);
				}}>OK</Button
			>
		</li>
	{/each}
</ol>
