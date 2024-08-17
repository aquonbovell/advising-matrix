<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { Chart } from 'chart.js/auto';

	export let data: PageData;
	let chartCanvas;

	onMount(async () => {
		await data.student;
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
									data.student.completedcredits,
									data.student.totalcredits - data.student.completedcredits
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
