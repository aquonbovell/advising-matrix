<script lang="ts">
	import { page } from '$app/stores';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';

	let advisorName = 'Mr.TempName';
	let gpa = 3.99;
</script>

<div class="container">
	<section id="welcome" class="mb-15">
		<h1 class="font-semibold text-5xl">
			<!-- {$page.data.user.role} Dashboard -->
			Welcome 
		</h1>
	</section>
	<section id="charts" class="">
		<PieChart />
		<div id="completed-courses" class="sm:grid sm:grid-cols-3">
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
