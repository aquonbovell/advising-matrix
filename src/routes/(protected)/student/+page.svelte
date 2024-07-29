<script lang="ts">
	import { page } from '$app/stores';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';

	// placeholders
	let advisorName = 'Mr.TempName';
	let gpa = 3.99;
	let totalCredits = 3*8; 
	let mandatoryCredits = 3*6;
	let electiveCredits = 3*1;
	let foundationCredits = 3*1;
	let name = "John";
	let major = "BSc Computer Science";
	let studentId = 400000000;
</script>

<div class="flex flex-col max-h-full mx-10">
	<section id="welcome" class="flex align-middle justify-between my-5 ">
		<div id="student" class="flex flex-col items-start">
			<h1 class="font-semibold text-5xl">
				<!-- {$page.data.user.role} Dashboard -->
				Welcome {name}
			</h1>
			<h4 class="mx-1 my-3 text-xl opacity-60">{studentId}</h4>
		</div>
		<h2 class="text-2xl mx-10">{major}</h2>
	</section>
	<section id="charts" class="flex flex-col my-10 justify-between">
		<div class="flex-1 justify-center h-full">
			<PieChart title="Degree Progress"/>
		</div>
		<div id="completed-courses" class="flex flex-row justify-evenly">
			<DonutChart id="mandatory" title="Mandatory Courses" />
			<DonutChart id="elective"  title="Elective Courses"/>
			<DonutChart id="foundation"  title="Foundation Courses"/>
		</div>
	</section>
	<section id="bottom" class="flex justify-between my-10 mx-5 text-xl">
		<div id="advisor" class="flex">
			<p class="mx-1 opacity-100">Academic Advisor</p>
			<p class="mx-1 opacity-60">{advisorName}</p>
		</div>
		<div id="gpa" class="flex">
			<p class="mx-1 opacity-100">GPA</p>
			<p class="mx-1 opacity-60">{gpa}</p>
		</div>
	</section>
</div>
