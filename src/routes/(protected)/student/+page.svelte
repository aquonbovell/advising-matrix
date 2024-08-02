<script lang="ts">
	import { page } from '$app/stores';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	console.log(data);

	// placeholders
	let advisorName = 'Mr.TempName';
	let gpa = 3.99;
	let totalCredits = 3 * 8;
	let mandatoryCredits = 3 * 6;
	let electiveCredits = 3 * 1;
	let foundationCredits = 3 * 1;
	// let name = data.user?.name;
	let name = "John"
	let major = 'BSc Computer Science';
	let studentId = 400000000;
</script>

<div class="mx-10 flex max-h-full flex-col">
	<section id="welcome" class="my-5 flex justify-between align-middle">
		<div id="student" class="flex flex-col items-start">
			<h1 class="text-5xl font-semibold">
				<!-- {$page.data.user.role} Dashboard -->
				Welcome {name}
			</h1>
			<h4 class="mx-1 my-3 text-xl opacity-60">{studentId}</h4>
		</div>
		<h2 class="mx-10 text-2xl">{major}</h2>
	</section>
	<section id="charts" class="my-10 flex flex-col justify-between">
		<div class="h-full flex-1 justify-center">
			<PieChart title="Degree Progress" />
		</div>
		<div id="completed-courses" class="flex flex-row justify-evenly">
			<DonutChart id="mandatory" title="Mandatory Courses" />
			<DonutChart id="elective" title="Elective Courses" />
			<DonutChart id="foundation" title="Foundation Courses" />
		</div>
	</section>
	<section id="bottom" class="mx-5 my-10 flex justify-between text-xl">
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
