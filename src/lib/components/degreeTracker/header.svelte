<script lang="ts">
	import { gpa, completedCourses } from '$lib/stores/degreeTracker';
	import { createMajorMinor } from '$lib/utils';

	export let degreeName;

	let degree = {
		...createMajorMinor(degreeName),
		classification: 'Level III'
	};
</script>

<header class="flex flex-wrap justify-between gap-x-12 gap-y-6 text-base">
	<div class="flex flex-col items-start">
		<!-- Student Degree Name -->
		<span class="uppercase text-gray-500">Current Degree</span>
		<div class="flex gap-4">
			<div class="flex flex-col">
				<span class="text-sm uppercase text-gray-500">Major(s)</span>
				{#each degree.major as name}
					<div class="font-semibold">
						{name}
					</div>
				{/each}
			</div>
			<div class="flex flex-col">
				<span class="text-sm uppercase text-gray-500">Minor(S)</span>
				<span class="font-semibold">{degree.minor}</span>
			</div>
		</div>
	</div>
	<div class="flex flex-col items-center">
		<span class="uppercase text-gray-500">Classification</span>
		<span class="font-semibold">{degree.classification}</span>
	</div>
	<div class="flex flex-col items-center">
		<span class="uppercase text-gray-500">Overall GPA</span>
		<span class="font-semibold">{$gpa}</span>
	</div>
	<div class="flex flex-col items-center">
		<span class="uppercase text-gray-500">Academic Standing</span>
		{#if Object.values($completedCourses).filter((completed) => completed == true).length > 0}
			{#if parseFloat($gpa) < 2.0}
				<span class="font-semibold text-red-500">Academic Warning</span>
			{:else}
				<span class="font-semibold">Good Standing</span>
			{/if}
		{:else}
			<span class="font-semibold">No courses completed</span>
		{/if}
	</div>
</header>
