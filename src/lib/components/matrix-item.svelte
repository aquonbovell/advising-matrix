<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import MatrixCourse from './matrix-course.svelte';
	let {
		item
	}: {
		item: {
			type: 'courses' | 'faculties' | 'credits';
			option: 'all' | 'one';
			level: number[];
			details: (string | undefined)[];
			id: string;
			credits: number;
		};
	} = $props();
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between gap-3 px-4 py-3">
		<Card.Title class="">{item.type}</Card.Title>
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
		<MatrixCourse course={item.details} />
	</Card.Content>
</Card.Root>
