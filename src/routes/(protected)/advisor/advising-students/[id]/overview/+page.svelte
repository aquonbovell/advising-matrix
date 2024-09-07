<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { Chart } from 'chart.js/auto';

	export let data: PageData;
	let totalCreditsChart;
	let levelOneCreditsChart;
	let levelTwoThreeCreditsChart;
	let foundationCreditsChart;

	onMount(async () => {
		await data.student;
		totalCreditsChart = document.querySelector('canvas#totalCredits');
		if (totalCreditsChart) {
			const ctx = totalCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Total University Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Total University Credits',
								data: [
									data.student.completedcredits,
									data.student.totalcredits - data.student.completedcredits
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
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
								text: 'Level 1 University Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Level 1 University Credits',
								data: [
									data.student.levelOne,
									data.student.totalLevelOneCredits - data.student.levelOne
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
		levelTwoThreeCreditsChart = document.querySelector('canvas#levelTwoThreeCredits');
		if (levelTwoThreeCreditsChart) {
			const ctx = levelTwoThreeCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Level 2/3 University Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Level 2/3 University Credits',
								data: [
									data.student.levelTwoThree,
									data.student.totalLevelTwoThreeCredits - data.student.levelTwoThree
								],
								backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
								hoverOffset: 3
							}
						]
					}
				});
			}
		}
		foundationCreditsChart = document.querySelector('canvas#foundationCredits');
		if (foundationCreditsChart) {
			const ctx = foundationCreditsChart.getContext('2d');
			if (ctx) {
				new Chart(ctx, {
					type: 'doughnut',
					options: {
						plugins: {
							title: {
								display: true,
								text: 'Foundation University Credits'
							}
						}
					},
					data: {
						labels: ['Completed credits', 'Remaining Credits'],
						datasets: [
							{
								label: 'Foundation University Credits',
								data: [
									data.student.foundationCredits,
									data.student.totalFoundationCredits - data.student.foundationCredits
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
	<canvas class=" aspect-square max-h-48 max-w-48" id="totalCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="foundationCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelOneCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelTwoThreeCredits"></canvas>
</div>
