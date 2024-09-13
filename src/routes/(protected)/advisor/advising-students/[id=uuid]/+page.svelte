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
	import { notifications } from '$lib/stores/notifications';
	export let data: PageData;

	const { form, constraints, errors, enhance, delayed, message } = superForm(data.form, {
		delayMs: 500
	});
	$: majorName = data.majors.find((major) => major.id === $form.majorId)?.name ?? '';
	$: minorName = data.minors.find((minor) => minor.id === $form.minorId)?.name ?? '';
	$: setTimeout(() => {
		$message = '';
	}, 5000);
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

<div class="">
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
						<div>Undergraduate Degree</div>
					</CardHeader>
					<CardContent>
						<div class="flex flex-col gap-4 md:flex-row">
							<div class="w-full">
								<Label for="majorId">Major</Label>
								<Input
									type="text"
									name="majorId"
									aria-hidden
									class="hidden"
									hidden
									bind:value={$form.majorId}
								/>
								<Select.Root
									name="majorId"
									selected={{ value: $form.majorId }}
									onSelectedChange={(value) => ($form.majorId = value?.value ?? '')}
									{...$constraints.majorId}
								>
									<Select.Trigger class="w-full">
										<Select.Value placeholder={majorName} />
									</Select.Trigger>
									<Select.Content class="max-h-72 overflow-y-auto">
										{#each data.majors as major}
											<Select.Item value={major.id}>{major.name}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							<div class="w-full">
								<Label for="minorId">Minor</Label>
								<Input
									type="text"
									name="minorId"
									aria-hidden
									class="hidden"
									hidden
									bind:value={$form.minorId}
								/>
								<Select.Root
									name="minorId"
									selected={{ value: $form.minorId }}
									onSelectedChange={(value) => ($form.minorId = value?.value ?? '')}
									{...$constraints.minorId}
								>
									<Select.Trigger class="w-full">
										<Select.Value placeholder={minorName} />
									</Select.Trigger>
									<Select.Content class="max-h-72 overflow-y-auto">
										{#each data.minors as minor}
											<Select.Item value={minor.id}>{minor.name}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					</CardContent>
				</Card>
				<!-- alternate Email -->
				<Card>
					<CardHeader>
						<div>Alternate Email</div>
						<div>For your security, please use your offical university email.</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="alternate_email">Alternate Email</Label>
							<Input
								type="email"
								id="alternate_email"
								name="alternate_email"
								error={$errors.alternate_email?.[0]}
								bind:value={$form.alternate_email}
								{...$constraints.alternate_email}
							/>
						</div>
						<div class="space-y-2">
							<Label for="alternate_email1">Confirm Alternate Email</Label>
							<Input
								type="email"
								id="alternate_email1"
								name="alternate_email1"
								error={$errors.alternate_email1?.[0]}
								bind:value={$form.alternate_email1}
								{...$constraints.alternate_email1}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
			<div class="pt-6">
				<Button type="submit">Update</Button>
			</div>
		</form>
	</div>
</div>
