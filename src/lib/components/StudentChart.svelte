<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';

	export let studentId;
	let levelFourCreditsChart;
	let levelOneCreditsChart;
	let levelTwoCreditsChart;
	let levelThreeCreditsChart;
	let data = {};

	onMount(async () => {
		const res = await fetch(`/api/student/${studentId}/overview`);
		data = await res.json();
		console.log(data);
		if (!data) return;

		levelOneCreditsChart = document.querySelector('canvas#levelOneCredits');
		if (levelOneCreditsChart) {
			const ctx = levelOneCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Level 1 Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Level 1',
								data: [
									data.overview.levelOne.completed,
									data.overview.levelOne.total - data.overview.levelOne.completed
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
		levelTwoCreditsChart = document.querySelector('canvas#levelTwoCredits');
		if (levelTwoCreditsChart) {
			const ctx = levelTwoCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Level 2 Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Level 2',
								data: [
									data.overview.levelTwo.completed,
									data.overview.levelTwo.total - data.overview.levelTwo.completed
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
		levelThreeCreditsChart = document.querySelector('canvas#levelThreeCredits');
		if (levelThreeCreditsChart) {
			const ctx = levelThreeCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Level 3 Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Level 3',
								data: [
									data.overview.levelThree.completed,
									data.overview.levelThree.total - data.overview.levelThree.completed
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
		levelFourCreditsChart = document.querySelector('canvas#levelFourCredits');
		if (levelFourCreditsChart) {
			const ctx = levelFourCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Level 4 Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Level 4',
								data: [
									data.overview.levelFour.completed,
									data.overview.levelFour.total - data.overview.levelFour.completed
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
	});
</script>

<div class="grid grid-cols-2">
	{#if Object.entries(data).length === 0}
		<p>Loading...</p>
	{/if}
	<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

	<canvas class=" aspect-square max-h-48 max-w-48" id="levelFourCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelThreeCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelOneCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelTwoCredits"></canvas>
</div>
