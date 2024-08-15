<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { Chart } from 'chart.js/auto';
	import { A } from 'flowbite-svelte';
	import Loading from '$lib/components/ui/Loading.svelte';
	import { completedCourses, type totalCredits } from '$lib/stores/degreeTracker';

	export let data: PageData;
	let code = data.props!.id;
	let chartCanvas;

	let studentData = { totalCredits: 0, completedCredits: 0 };

	onMount(async () => {
		const response = await fetch(`/api/student/${code}/details`);
		const data = await response.json();
		studentData.totalCredits = data.totalcredits;
		studentData.completedCredits = data.completedcredits;
		chartCanvas = document.querySelector('canvas');
		if (chartCanvas) {
			const ctx = chartCanvas.getContext('2d');
			console.log(ctx);
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'My First Dataset',
								data: [
									studentData.completedCredits,
									studentData.totalCredits - studentData.completedCredits
								],
								backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
	});
</script>

<canvas class=" aspect-square max-h-[28rem] min-h-72 min-w-72 max-w-md"></canvas>
