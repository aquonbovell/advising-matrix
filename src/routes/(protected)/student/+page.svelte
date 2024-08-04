<script lang="ts">
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// placeholders
	let advisorName = 'Mr.TempName';
	let gpa = 3.99;
	let totalCredits = 3 * 8;
	let mandatoryCredits = 3 * 6;
	let electiveCredits = 3 * 1;
	let foundationCredits = 3 * 1;
	// let name = data.user?.name;
	let name = 'John';
	let major = 'BSc Computer Science';
	let studentId = 400000000;
</script>

<div class=" flex flex-col p-4">
	<section id="welcome" class=" flex flex-col items-baseline justify-between md:flex-row">
		<div id="student" class="flex flex-col items-start">
			<h1 class="text-3xl font-semibold">
				<!-- {$page.data.user.role} Dashboard -->
				{#if data.student}
					Welcome {data.student.name}
				{:else}
					Anonomyous
				{/if}
			</h1>
			<!-- The is not needed -->
			<!-- <h4 class="mx-1 my-3 text-xl opacity-60">{studentId}</h4> -->
		</div>
		{#if data.student?.program}
			<h2 class="text-2xl">Bsc {data.student?.program}</h2>
		{:else}
			<h2 class="text-2xl">No Program</h2>
		{/if}
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
