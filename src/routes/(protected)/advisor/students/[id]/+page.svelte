<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import Input from '$lib/components/ui/Input.svelte';
	import * as Select from '$lib/components/ui/select';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { superForm } from 'sveltekit-superforms';
	import * as Alert from '$lib/components/ui/alert';
	export let data: PageData;

	const { form, constraints, errors, enhance, delayed, message } = superForm(data.form, {
		delayMs: 500
	});
	$: seletedMajorName = data.majors.find((major) => major.id === $form.programId)?.name ?? '';
	$: setTimeout(() => {
		$message = '';
	}, 5000);
</script>

<div class="">
	{#if $message}
		<Alert.Root class="text-green-600">
			<!-- <Terminal class="h-4 w-4" /> -->
			<Alert.Title>Heads up!</Alert.Title>
			<Alert.Description>{$message}</Alert.Description>
		</Alert.Root>
	{/if}
	{#if $errors._errors}
		<Alert.Root class="text-red-600">
			<!-- <Terminal class="h-4 w-4" /> -->
			<Alert.Title>Heads up!</Alert.Title>
			<Alert.Description>{$errors._errors[0]}</Alert.Description>
		</Alert.Root>
	{/if}
	<div class="px-4">
		<form action="?/save" method="post">
			<input type="text" name="id" hidden value={$form.id} />
			<header class="py-4">
				<div class="flex items-center space-x-3">
					<Avatar name={data.student.name} size="lg" />
					<div class="space-y-1">
						<h1 class="text-2xl font-bold">{data.student.name}</h1>
					</div>
				</div>
			</header>
			<div class="space-y-8">
				<!-- Student Details -->
				<Card>
					<CardContent class="space-y-6 pt-6">
						<div class="space-y-2">
							<Label for="name">Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="E.g. Jane Doe"
								error={$errors.name?.[0]}
								bind:value={$form.name}
								{...$constraints.name}
							/>
						</div>
						<div class="grid gap-3 md:grid-cols-3">
							<div class="space-y-2 md:col-span-2">
								<Label for="email">Email</Label>
								<Input
									id="email"
									name="email"
									placeholder="E.g. jane@mycavehill.uwi.edu"
									error={$errors.email?.[0]}
									bind:value={$form.email}
									{...$constraints.email}
								/>
							</div>
							<div class="space-y-2">
								<Label for="level" aria-disabled>Level</Label>
								<Select.Root name="level" disabled>
									<Select.Trigger class="w-full">
										<Select.Value placeholder="Level" />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="Level 1">Level 1</Select.Item>
										<Select.Item value="Level 2">Level 2</Select.Item>
										<Select.Item value="Level 3">Level 3</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					</CardContent>
				</Card>
				<!-- Student Major -->
				<Card>
					<CardHeader>
						<div>Undergraduate Major</div>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							<Label for="programId">Undergraduate Major</Label>
							<Input
								type="text"
								name="programId"
								aria-hidden
								class="hidden"
								hidden
								bind:value={$form.programId}
							/>
							<Select.Root
								name="programId"
								selected={{ value: $form.programId }}
								onSelectedChange={(value) => ($form.programId = value?.value ?? '')}
								{...$constraints.programId}
							>
								<Select.Trigger class="w-full">
									<Select.Value placeholder={seletedMajorName} />
								</Select.Trigger>
								<Select.Content class="max-h-72 overflow-y-auto">
									{#each data.majors as major}
										<Select.Item value={major.id}>{major.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</CardContent>
				</Card>
				<!-- Alternative Email -->
				<Card>
					<CardHeader>
						<div>Alternative Email</div>
						<div>For your security, please use your offical university email.</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="alternative-email" aria-disabled>Alternative Email</Label>
							<Input type="email" id="alternative-email" name="alternative-email" disabled />
						</div>
						<div class="space-y-2">
							<Label for="alternative-email1" aria-disabled>Confirm Alternative Email</Label>
							<Input type="email" id="alternative-email1" name="alternative-email" disabled />
						</div>
					</CardContent>
				</Card>
			</div>
			<div class="pt-6">
				<Button type="submit" class="bg-blue-600 hover:bg-blue-400 focus:bg-blue-300">Save</Button>
			</div>
		</form>
	</div>
</div>
