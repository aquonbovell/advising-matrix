<script lang="ts">
	// import type { ActionData, PageData } from './$types';
	// import { Button } from '$lib/components/ui/button';
	// import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	// import { Label } from '$lib/components/ui/label';
	// import Input from '$lib/components/ui/Input.svelte';
	// import * as Select from '$lib/components/ui/select';
	// import Avatar from '$lib/components/ui/Avatar.svelte';
	// import * as Alert from '$lib/components/ui/alert';
	// import PasswordRequirements from '$lib/components/PasswordRequirements.svelte';
	// import { enhance } from '$app/forms';
	// export let data: PageData;

	// export let form: ActionData;
	// $: setTimeout(() => {
	// 	if (form?.success) {
	// 		form = null;
	// 	}
	// 	if (form?.errors) {
	// 		form = null;
	// 	}
	// }, 10000);
	// $: selectedMajorName = data.programs.find((major) => major.id === data.program?.program_id)?.name;

	// let password = '';
	// let confirmPassword = '';

	// $: isPasswordValid =
	// 	password.length >= 8 &&
	// 	/[A-Z]/.test(password) &&
	// 	password === confirmPassword &&
	// 	password !== '';
</script>

<h1>Profile Settings</h1>

<!-- <div class="">
	{#if form?.success}
		<Alert.Root class="text-green-600"> -->
<!-- <Terminal class="h-4 w-4" /> -->
<!-- <Alert.Title>Heads up!</Alert.Title>
			<Alert.Description>{form.message}</Alert.Description>
		</Alert.Root>
	{/if} -->
<!-- {#if form?.error}
		<Alert.Root class="text-red-600">
			<Terminal class="h-4 w-4" />
			<Alert.Title>Heads up!</Alert.Title>
			<Alert.Description>{form.message}</Alert.Description>
		</Alert.Root>
	{/if} -->
<!-- <div class="px-4">
		<form action="?/save" method="post">
			<input type="text" name="id" hidden value={'$form.id'} />
			<header class="py-4">
				<div class="flex items-center space-x-3">
					<Avatar name={data.person?.name ?? 'A'} size="lg" />
					<div class="space-y-1">
						<h1 class="text-2xl font-bold">{data.person?.name}</h1>
					</div>
				</div>
			</header>
			<div class="space-y-8"> -->
<!-- Student Details -->
<!-- <Card>
					<CardContent class="space-y-6 pt-6">
						<div class="space-y-2">
							<Label for="name">Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="E.g. Jane Doe"
								value={data.person?.name}
								error={form?.errors?.name?.[0]}
							/>
						</div>
						<div
							class={`grid gap-3 ${data.person?.role == 'STUDENT' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
						>
							<div class="space-y-2 md:col-span-2">
								<Label for="email">Email</Label>
								<Input
									id="email"
									name="email"
									placeholder={data.person?.email}
									value={data.person?.email}
									disabled
									readonly
								/>
							</div>
							{#if data.person?.role === 'STUDENT'}
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
							{/if}
						</div>
					</CardContent>
				</Card> -->
<!-- Student Major -->
<!-- {#if data.person?.role === 'STUDENT'}
					<Card>
						<CardHeader>
							<div>Undergraduate Major</div>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								<Label for="programId">Undergraduate Major</Label>
								<Input type="text" name="programId" aria-hidden class="hidden" hidden />
								<Select.Root
									name="programId"
									selected={{ value: data?.program?.program_id }}
									disabled
								>
									<Select.Trigger class="w-full">
										<Select.Value placeholder={selectedMajorName} />
									</Select.Trigger>
									<Select.Content class="max-h-72 overflow-y-auto">
										{#each data.programs as major}
											<Select.Item value={major.id}>{major.name}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						</CardContent>
					</Card>
				{/if} -->
<!-- Alternative Email -->
<!-- <Card>
					<CardHeader>
						<div>Alternative Email</div>
						<div>For your security, please use your offical university email.</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="alternative-email">Alternative Email</Label>
							<Input
								type="email"
								id="alternative-email"
								name="alternative-email"
								readonly
								value={data.person?.alternate_email}
							/>
						</div>
						<div class="space-y-2">
							<Label for="alternative-email1">Confirm Alternative Email</Label>
							<Input
								type="email"
								id="alternative-email1"
								name="alternative-email"
								readonly
								value={data.person?.alternate_email}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
			<div class="pt-6">
				<Button type="submit" class="bg-blue-600 hover:bg-blue-400 focus:bg-blue-300">Save</Button>
			</div>
		</form>
		<form action="?/resetPassword" method="post" use:enhance>
			<input type="text" name="id" hidden value={data.person?.id} />

			<div class="space-y-8 pt-8">
				<Card>
					<CardHeader>
						<div>Reset Password</div>
						<div>For your security, please use your keep your password safe</div>
					</CardHeader>
					<CardContent class="space-y-4">
						{#if form?.data_invalid}
							<Alert.Root class="text-red-600">
								<Terminal class="h-4 w-4" />
								<Alert.Title>Heads up!</Alert.Title>
								<Alert.Description>{form.data_invalid}</Alert.Description>
							</Alert.Root>
						{/if}
						<Input
							type="password"
							id="old_password"
							name="old_password"
							label="Current Password"
							placeholder="Enter your current password"
							error={form?.errors?.old_password}
						/>
						<Input
							type="password"
							id="password"
							name="password"
							label="Password"
							placeholder="Enter your password"
							error={form?.errors?.password}
							bind:value={password}
						/>
						<Input
							type="password"
							id="confirm_password"
							name="confirm_password"
							label="Confirm Password"
							placeholder="Confirm your password"
							error={form?.errors?.confirm_password}
							bind:value={confirmPassword}
						/>
						<PasswordRequirements {password} {confirmPassword} />
						<button
							type="submit"
							class="w-max rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!isPasswordValid}
						>
							Reset Password
						</button>
					</CardContent>
				</Card>
			</div>
			<div class="pt-6"></div>
		</form>
	</div>
</div>
 -->
