<script lang="ts">
	import { page } from '$app/stores';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';

	let advisorName = 'Mr.TempName';
	let gpa = 3.99;
</script>

<div class="container px-6 py-3">
	<section id="welcome">
		<h1>{$page.data.user.role} Dashboard</h1>
	</section>
	<section id="charts" class="">
		<PieChart />
		<div id="completed-courses" class="">
			<DonutChart id="mandatory" />
			<DonutChart id="elective" />
			<DonutChart id="foundation" />
		</div>
	</section>
	<section id="bottom">
		<span id="advisor">
			<p>Academic Advisor</p>
			<p>{advisorName}</p>
		</span>
		<span id="gpa">
			<p>GPA</p>
			<p>{gpa}</p>
		</span>
	</section>
</div>
