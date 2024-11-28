<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/';
	import * as Label from '$lib/components/ui/label';
	import * as Input from '$lib/components/ui/input/';
	import * as Button from '$lib/components/ui/button/';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/';
	import { Badge } from '$lib/components/ui/badge/';
	import { buttonVariants } from '$lib/components/ui/button/';
	import { applyAction, enhance } from '$app/forms';
	import { requirementOption, requirementType } from '$lib/types';
	import disciplines from './disciplines.json';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
	let isOpen = $state(false);
</script>

<Card.Root class="glass mx-auto max-w-xl bg-inherit">
	<Card.Header>
		<Card.Title>Matrix Major -{data.minor.name}</Card.Title>
		<Card.Description>Manage this minor details</Card.Description>
	</Card.Header>
	<Card.Content>
		<form>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label.Root for="name">Name</Label.Root>
					<Input.Root
						id="name"
						placeholder="Science & Technology"
						readonly
						value={data.minor.name}
					/>
				</div>
				<h1 class="text-base font-semibold">Requirements</h1>

				<div class="grid items-baseline justify-between gap-3 md:grid-cols-2">
					{#each data.minor.requirements as requirement, i (requirement.id)}
						<div class="flex flex-col gap-3">
							<div class="flex items-center justify-between">
								<h2 class="text-sm font-semibold">Requirement #{i + 1}</h2>
							</div>
							<div class="text-sm font-semibold">Details Type</div>
							<RadioGroup.Root bind:value={requirement.type} id={requirement.id} class="flex gap-3">
								{#each Object.values(requirementType) as type}
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value={type} />
										<Label.Root for={type}>{type.toLowerCase()}</Label.Root>
									</div>
								{/each}
							</RadioGroup.Root>

							<div class="text-sm font-semibold">Type</div>
							<RadioGroup.Root bind:value={requirement.option} class="flex gap-3">
								{#each Object.values(requirementOption) as option}
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value={option} />
										<Label.Root for={option}>{option.toLowerCase()}</Label.Root>
									</div>
								{/each}
							</RadioGroup.Root>
							<div class="text-sm font-semibold">Levels</div>
							<Input.Root
								value={requirement.level.map((l) => `Level ` + l)}
								placeholder="Requirement level(s)"
								readonly
							/>

							<div class="text-sm font-semibold">Credits</div>
							<Input.Root
								value={requirement.credits}
								type="number"
								placeholder="Requirement credits"
								readonly
							/>

							<!-- Course Dropdown  -->
							{#if requirement.type === 'COURSES'}
								<div class="text-sm font-semibold">Courses Details</div>

								<div class="h-fit rounded border bg-background p-2">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: data.courses.find((c) => c.id == cv)?.name, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										Select from verified courses...
									{/if}
								</div>
							{:else if requirement.type === 'DISCIPLINES'}
								<div class="text-sm font-semibold">Discipline Details</div>
								<div class="h-fit rounded border bg-background p-2">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: disciplines.find((d) => d == cv), value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										Select a verified discipline...
									{/if}
								</div>
							{:else if requirement.type === 'FACULTIES'}
								<div class="text-sm font-semibold">Faculties Details</div>
								<div class="h-fit rounded border bg-background p-2">
									{#if requirement.details && requirement.details.length > 0}
										<div class="flex flex-wrap justify-start gap-2">
											{#each requirement.details.map( (cv) => ({ label: data.faculties.find((f) => f.id == cv)?.name, value: cv }) ) as { label }}
												<Badge>{label}</Badge>
											{/each}
										</div>
									{:else}
										Select a verified discipline...
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		{#if data.user.role === 'ADMIN'}
			<Button.Root variant="outline" href={`/minors/${data.minor.id}/edit`}>Edit</Button.Root>
		{/if}
		{#if data.user.role === 'ADMIN'}
			<AlertDialog.Root bind:open={isOpen}>
				<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
					Delete
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently delete this record from our
							servers.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ result }) => {
									// `result` is an `ActionResult` object

									if (result.type === 'failure') {
										isOpen = false;
										toast.error(result.data?.message as string, { duration: 2000 });
									} else if (result.type === 'success') {
										isOpen = false;
										toast.success('Course deleted successfully', { duration: 2000 });
									} else {
										isOpen = false;
										toast.error('An error occurred', { duration: 2000 });
									}
									await applyAction(result);
								};
							}}
							class="flex gap-2"
						>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
						</form>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</Card.Footer>
</Card.Root>
