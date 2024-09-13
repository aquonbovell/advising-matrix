<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import moment from 'moment';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getToastState } from './toast-state.svelte';
	import type { Toast } from '$lib/types';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
	const toastState = getToastState();

	let toasts: Toast[] = [];

	toastState.toasts.subscribe((value) => {
		toasts = value;
	});
</script>

<ol
	class="notifications absolute bottom-4 right-4
  flex flex-col gap-3
"
>
	{#each toasts as { title, id, message, type }, _ (id)}
		<li animate:flip transition:fly={{ y: 30 }}>
			<Alert.Root variant={`${type === 'error' ? 'destructive' : 'default'}`}>
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>{title}</Alert.Title>
				<Alert.Description
					><div class="flex justify-between gap-2">
						<p class="max-w-[30ch]">{message}</p>
						<Button
							variant="outline"
							class="text-inherit hover:text-inherit"
							on:click={() => {
								toastState.remove(id);
							}}>OK</Button
						>
					</div>
					<div class="text-sm opacity-90">{moment().format('dddd, MMMM D, YYYY [at] h:mm A')}</div>
				</Alert.Description>
			</Alert.Root>
		</li>
	{/each}
</ol>
