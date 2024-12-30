<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import MatrixItem from './matrix-item.svelte';

	let {
		discipline
	}: {
		discipline: {
			type: 'courses' | 'faculties' | 'credits';
			option: 'all' | 'one';
			level: number[];
			details: (string | undefined)[];
			id: string;
			credits: number;
		}[];
	} = $props();
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
		<Card.Title class="">Bsc. Computer Science with Mathematics</Card.Title>
		<form
			action="?/save"
			method="post"
			use:enhance={() => {
				return async ({ result }) => {
					// `result` is an `ActionResult` object
					await applyAction(result);
				};
			}}
		>
			<Button.Root type="submit" variant="outline">Save</Button.Root>
		</form>
	</Card.Header>
	<Card.Content class="grid grid-cols-12 gap-3 px-4 py-3 ">
		<Button.Root variant="ghost" type="button" class="col-span-2">Degree GPA: 4.6</Button.Root>
		<Button.Root variant="ghost" type="button" class="col-span-2">Overall GPA: 4.3</Button.Root>
		<div class="col-span-5 col-start-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
			<Progress.Root value={10} max={84} class="h-3" />
			<p class="w-fit">{10} / {84} Credits</p>
		</div>
	</Card.Content>
</Card.Root>

<pre>{JSON.stringify(discipline, null, 2)}</pre>

{#each discipline as item}
	<MatrixItem {item} />
{/each}
