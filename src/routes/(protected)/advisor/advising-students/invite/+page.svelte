<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Select from '$lib/components/ui/dropdown/Select.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Option from '$lib/components/ui/dropdown/Option.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { notifications } from '$lib/stores/notifications';

	export let data;

	const { form, constraints, errors, enhance, delayed, message } = superForm(data.form, {
		delayMs: 500
	});

	if ($message) {
		notifications.info($message, 5000);
	}

	$: {
		if ($errors._errors) {
			const messages = Object.values($errors._errors);

			for (let message of messages) {
				notifications.info(message, 5000);
			}
		}
	}
</script>

<h1 class="mb-4 text-2xl font-bold">Invite Student</h1>

<form method="POST" use:enhance class="space-y-4">
	<div>
		<Input
			type="text"
			id="name"
			name="name"
			label="Student Name"
			placeholder="Enter student's name"
			required
			error={$errors.name?.[0]}
			bind:value={$form.name}
			{...$constraints.name}
		/>

		<div class="flex flex-col py-4 md:flex-row md:gap-3">
			<div class="w-full">
				<Input
					type="email"
					id="official_email"
					name="official_email"
					label="Student Official Email"
					placeholder="Enter student's official email"
					required
					pattern="[a-zA-Z0-9._%+-]+@mycavehill\.uwi\.edu"
					error={$errors.official_email?.[0]}
					bind:value={$form.official_email}
					{...$constraints.official_email}
				/>
			</div>
			<div class="w-full">
				<Input
					type="email"
					id="alternate_email"
					name="alternate_email"
					label="Student Alternate Email"
					placeholder="Enter student's alternate email"
					required
					error={$errors.alternate_email?.[0]}
					bind:value={$form.alternate_email}
					{...$constraints.alternate_email}
				/>
			</div>
		</div>
		<div class="flex gap-4">
			<div class="w-full">
				<Select
					id="majorId"
					name="majorId"
					label="Major"
					placeholder="Select a Major"
					required={true}
					error={$errors.majorId?.[0]}
					bind:value={$form.majorId}
					{...$constraints.majorId}
				>
					{#each data.majors as program}
						<Option value={program.id}>{program.name}</Option>
					{/each}
				</Select>
			</div>
			<div class="w-full">
				<Select
					id="minorId"
					name="minorId"
					label="Minor"
					placeholder="Select a Minor"
					error={$errors.minorId?.[0]}
					bind:value={$form.minorId}
					{...$constraints.minorId}
				>
					{#each data.minors as program}
						<Option value={program.id}>{program.name}</Option>
					{/each}
				</Select>
			</div>
		</div>
	</div>

	<Button type="submit" loading={$delayed}>Send Invitation</Button>
</form>
