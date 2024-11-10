<script lang="ts">
	import { Chart } from 'chart.js/auto';
	import { trpc } from '$lib/trpc';
	export let studentId;
	let levelFourCreditsChart;
	let levelOneCreditsChart;
	let levelTwoCreditsChart;
	let levelThreeCreditsChart;

	$: studentOverview = trpc.advisor.studentOverview.query({ id: studentId ?? '' });

	$: {
		if ($studentOverview.data) {
			const overview = $studentOverview.data;
			levelOneCreditsChart = document.querySelector('canvas#levelOneCredits');
			if (levelOneCreditsChart) {
				const ctx = (levelOneCreditsChart as HTMLCanvasElement).getContext('2d');
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
										overview.student.levelOne.completed,
										overview.student.levelOne.credits - overview.student.levelOne.completed
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
				const ctx = (levelTwoCreditsChart as HTMLCanvasElement).getContext('2d');
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
										overview.student.levelTwo.completed,
										overview.student.levelTwo.credits - overview.student.levelTwo.completed
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
				const ctx = (levelThreeCreditsChart as HTMLCanvasElement).getContext('2d');
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
										overview.student.levelThree.completed,
										overview.student.levelThree.credits - overview.student.levelThree.completed
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
				const ctx = (levelFourCreditsChart as HTMLCanvasElement).getContext('2d');
				if (ctx) {
					new Chart(ctx, {
						type: 'doughnut',
						options: {
							plugins: {
								title: {
									display: true,
									text: 'Electives'
								}
							}
						},
						data: {
							labels: ['Completed credits', 'Remaining Credits'],
							datasets: [
								{
									label: 'Electives',
									data: [
										overview.student.forCredits.completed,
										overview.student.forCredits.credits - overview.student.forCredits.completed
									],
									backgroundColor: ['rgb(35, 206, 107)', 'rgb(54, 162, 235)'],
									hoverOffset: 3
								}
							]
						}
					});
				}
			}
		}
	}
</script>

<div class="mx-auto grid max-w-max grid-cols-2">
	{#if $studentOverview.isLoading}
		<p>Loading...</p>
	{/if}

	<canvas class=" aspect-square max-h-48 max-w-48" id="levelOneCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelTwoCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelThreeCredits"></canvas>
	<canvas class=" aspect-square max-h-48 max-w-48" id="levelFourCredits"></canvas>
</div>
