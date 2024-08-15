<script lang="ts" defer>
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';

	export let code: string;
	let dialogOpen = false;
	let studentData = { credits: 0 };
	let chartCanvas;

	// Function to toggle dialog visibility
	function toggle() {
		dialogOpen = !dialogOpen;
	}

	// Fetch student data when component mounts
	onMount(async () => {
		const response = await fetch(`/api/student/${code}/details`);
		const data = await response.json();
		studentData.credits = data.credits;
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(code)}>
				Copy student code
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href={$page.url + '/' + code + '/'}>View Student</DropdownMenu.Item>
		<DropdownMenu.Item href={$page.url + '/' + code + '/overview'}
			>View Student Overview</DropdownMenu.Item
		>
		<Dialog.Root>
			<DropdownMenu.Item
				on:click={(event) => {
					event.preventDefault();
				}}><Dialog.Trigger>View Student Overview</Dialog.Trigger></DropdownMenu.Item
			>
			<Dialog.Content>
				<Dialog.Header on:click={toggle}>
					<Dialog.Title>Student Overview - Bsc.</Dialog.Title>
					<Dialog.Description>
						{studentData.credits} Credits Applied
						<canvas bind:this={chartCanvas} id="myChart"></canvas>
					</Dialog.Description>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>

		<DropdownMenu.Item href={$page.url + '/' + code + '/degree-tracker'}
			>View Student Degree</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
